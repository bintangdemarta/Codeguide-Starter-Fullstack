import { NextRequest } from 'next/server';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { devices, telemetryData } from '../../../db/schema/wind-dashboard';
import { z } from 'zod';
import { requireUserAuth } from '../../../lib/auth-middleware';

const queryParamsSchema = z.object({
  deviceId: z.string().optional(),
  severity: z.string().optional(),
  limit: z.string().optional().default('50'),
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
      severity: url.searchParams.get('severity'),
      limit: url.searchParams.get('limit'),
    });

    if (!queryParams.success) {
      return Response.json(
        { error: 'Invalid query parameters', details: queryParams.error.flatten() },
        { status: 400 }
      );
    }

    const { deviceId, severity, limit } = queryParams.data;

    // Validate limit
    const limitNum = Math.min(parseInt(limit || '50', 10), 1000); // Max 1000 records

    // Get recent telemetry data that might indicate alerts, filtered by user
    let query = db
      .select({
        id: telemetryData.id,
        deviceId: devices.id,
        deviceCode: devices.deviceCode,
        timestamp: telemetryData.timestamp,
        windSpeed: telemetryData.windSpeed,
        windDirection: telemetryData.windDirection,
        temperature: telemetryData.temperature,
        humidity: telemetryData.humidity,
        batteryLevel: telemetryData.batteryLevel,
        signalStrength: telemetryData.signalStrength,
      })
      .from(telemetryData)
      .innerJoin(devices, eq(telemetryData.deviceId, devices.id))
      .where(eq(devices.userId, authResult.user.id)) // Only allow access to user's devices
      .orderBy(desc(telemetryData.timestamp))
      .limit(limitNum);

    // Apply filters
    if (deviceId) {
      query = query.where(eq(devices.deviceCode, deviceId));
    }

    const rawTelemetry = await query;

    // Identify potential alerts based on thresholds
    const alerts = rawTelemetry.map(record => {
      const alertsList: any[] = [];
      const windSpeed = parseFloat(record.windSpeed || '0');
      const temperature = parseFloat(record.temperature || '0');
      const humidity = parseFloat(record.humidity || '0');
      const batteryLevel = parseFloat(record.batteryLevel || '0');
      const signalStrength = record.signalStrength || 0;

      // High wind speed alert (>20 m/s)
      if (windSpeed > 20) {
        alertsList.push({
          type: 'HIGH_WIND_SPEED',
          severity: 'warning',
          message: `High wind speed detected: ${windSpeed} m/s`,
          value: windSpeed,
          threshold: 20,
        });
      }

      // Extreme wind speed alert (>30 m/s)
      if (windSpeed > 30) {
        alertsList.push({
          type: 'EXTREME_WIND_SPEED',
          severity: 'critical',
          message: `Extreme wind speed detected: ${windSpeed} m/s`,
          value: windSpeed,
          threshold: 30,
        });
      }

      // High temperature alert (>35°C)
      if (temperature > 35) {
        alertsList.push({
          type: 'HIGH_TEMPERATURE',
          severity: 'warning',
          message: `High temperature detected: ${temperature} °C`,
          value: temperature,
          threshold: 35,
        });
      }

      // Low battery alert (<20%)
      if (batteryLevel < 20 && batteryLevel > 0) {
        alertsList.push({
          type: 'LOW_BATTERY',
          severity: 'warning',
          message: `Low battery detected: ${batteryLevel}%`,
          value: batteryLevel,
          threshold: 20,
        });
      }

      // Critical low battery alert (<10%)
      if (batteryLevel < 10 && batteryLevel > 0) {
        alertsList.push({
          type: 'CRITICAL_BATTERY',
          severity: 'critical',
          message: `Critical battery level: ${batteryLevel}%`,
          value: batteryLevel,
          threshold: 10,
        });
      }

      // Poor signal alert
      if (signalStrength < -80) {
        alertsList.push({
          type: 'POOR_SIGNAL',
          severity: 'warning',
          message: `Poor signal strength: ${signalStrength} dBm`,
          value: signalStrength,
          threshold: -80,
        });
      }

      return {
        id: record.id,
        deviceId: record.deviceId,
        deviceCode: record.deviceCode,
        timestamp: record.timestamp,
        alerts: alertsList,
      };
    })
    .filter(record => record.alerts.length > 0); // Only keep records with alerts

    // Apply severity filter if specified
    if (severity) {
      const filteredAlerts = alerts.map(record => ({
        ...record,
        alerts: record.alerts.filter((alert: any) => alert.severity === severity),
      })).filter(record => record.alerts.length > 0);

      return Response.json({
        success: true,
        alerts: filteredAlerts,
      });
    }

    return Response.json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}