import { NextRequest } from 'next/server';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { devices, deviceStatus, telemetryData } from '../../../db/schema/wind-dashboard';
import { z } from 'zod';
import { requireUserAuth } from '../../../lib/auth-middleware';

const queryParamsSchema = z.object({
  deviceId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await requireUserAuth(request);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const url = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = queryParamsSchema.safeParse({
      deviceId: url.searchParams.get('deviceId'),
    });

    if (!queryParams.success) {
      return Response.json(
        { error: 'Invalid query parameters', details: queryParams.error.flatten() },
        { status: 400 }
      );
    }

    const { deviceId } = queryParams.data;

    // Build query for device health, filtered by user
    let deviceQuery = db
      .select({
        id: devices.id,
        deviceCode: devices.deviceCode,
        location: devices.location,
        status: devices.status,
        firmwareVersion: devices.firmwareVersion,
        lastSeen: devices.lastSeen,
        installationDate: devices.installationDate,
      })
      .from(devices)
      .where(eq(devices.userId, authResult.user.id)); // Only allow access to user's devices

    if (deviceId) {
      deviceQuery = deviceQuery.where(eq(devices.deviceCode, deviceId));
    }

    const deviceList = await deviceQuery;

    // Get status for each device
    const devicesWithHealth = await Promise.all(
      deviceList.map(async (device) => {
        // Get status
        const statusResult = await db
          .select()
          .from(deviceStatus)
          .where(eq(deviceStatus.deviceId, device.id))
          .limit(1);

        const status = statusResult.length > 0 ? statusResult[0] : null;

        // Calculate uptime metrics
        const now = new Date();
        let uptimePercentage = 0;

        // Get recent telemetry data to calculate uptime
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentTelemetry = await db
          .select({
            timestamp: telemetryData.timestamp,
          })
          .from(telemetryData)
          .where(
            and(
              eq(telemetryData.deviceId, device.id),
              gte(telemetryData.timestamp, oneDayAgo)
            )
          )
          .orderBy(desc(telemetryData.timestamp));

        // Calculate if device was active in the last 24 hours
        let isOnline = false;
        if (recentTelemetry.length > 0) {
          const lastTransmission = new Date(recentTelemetry[0].timestamp);
          isOnline = (now.getTime() - lastTransmission.getTime()) < (30 * 60 * 1000); // 30 min threshold
        }

        // Get error metrics
        const errorCodes = status?.errorCodes || [];
        const errorCount = Array.isArray(errorCodes) ? errorCodes.length : 0;

        // Get data quality metrics
        const dataPointsInLastHour = await db
          .select({ count: sql<number>`count(*)` })
          .from(telemetryData)
          .where(
            and(
              eq(telemetryData.deviceId, device.id),
              gte(
                telemetryData.timestamp,
                sql`NOW() - INTERVAL '1 hour'`
              )
            )
          );

        const dataPointsCount = dataPointsInLastHour[0].count || 0;

        // Calculate battery metrics
        const batteryLevel = status?.batteryLevel || 0;
        const signalStrength = status?.signalStrength || 0;

        // Determine health status based on metrics
        let healthStatus = 'good';
        if (batteryLevel && parseFloat(batteryLevel.toString()) < 20) healthStatus = 'warning';
        if (signalStrength && signalStrength < -80) healthStatus = 'warning';
        if (errorCount > 0) healthStatus = 'warning';
        if (!isOnline) healthStatus = 'critical';

        return {
          id: device.id,
          deviceCode: device.deviceCode,
          location: device.location,
          status: device.status,
          firmwareVersion: device.firmwareVersion,
          lastSeen: device.lastSeen,
          installationDate: device.installationDate,
          health: {
            status: healthStatus,
            isOnline,
            uptimePercentage,
            batteryLevel: batteryLevel ? parseFloat(batteryLevel.toString()) : null,
            signalStrength,
            errorCount,
            dataPointsLastHour: dataPointsCount,
            lastTransmission: status?.lastTransmission || null,
            maintenanceCount: status?.maintenanceCount || 0,
          }
        };
      })
    );

    // Calculate overall system metrics
    const totalDevices = devicesWithHealth.length;
    const activeDevices = devicesWithHealth.filter(d => d.health.isOnline).length;
    const warningDevices = devicesWithHealth.filter(d => d.health.status === 'warning').length;
    const criticalDevices = devicesWithHealth.filter(d => d.health.status === 'critical').length;

    return Response.json({
      success: true,
      systemHealth: {
        totalDevices,
        activeDevices,
        warningDevices,
        criticalDevices,
        healthyDevices: totalDevices - warningDevices - criticalDevices,
        overallHealth: totalDevices > 0
          ? (activeDevices / totalDevices) * 100
          : 0,
      },
      devices: devicesWithHealth,
    });
  } catch (error) {
    console.error('Error getting device health metrics:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}