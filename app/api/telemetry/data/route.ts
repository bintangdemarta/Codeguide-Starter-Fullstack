import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { devices, telemetryData, deviceStatus } from '../../../../db/schema/wind-dashboard';
import { requireDeviceAuth } from '../../../../lib/auth-middleware';
import { processTelemetryForAlerts, updateDeviceStatusWithAlerts } from '../../../../lib/alert-service';

export async function POST(request: NextRequest) {
  // Authenticate device
  const authResult = await requireDeviceAuth(request);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const body = await request.json();

    const {
      device_id: deviceId,
      timestamp,
      location,
      data,
      metadata
    } = body;

    if (!deviceId) {
      return Response.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    // Check if device exists
    const device = await db
      .select()
      .from(devices)
      .where(eq(devices.deviceCode, deviceId))
      .limit(1);

    if (device.length === 0) {
      return Response.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const deviceRecord = device[0];

    // Prepare telemetry values
    const windSpeed = data.wind_speed ? parseFloat(data.wind_speed).toString() : null;
    const temperature = data.temperature ? parseFloat(data.temperature).toString() : null;
    const humidity = data.humidity ? parseFloat(data.humidity).toString() : null;
    const batteryLevel = metadata?.battery ? parseFloat(metadata.battery).toString() : null;
    const signalStrength = metadata?.signal || null;

    // Insert telemetry data
    const [newTelemetry] = await db
      .insert(telemetryData)
      .values({
        deviceId: deviceRecord.id,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        windSpeed,
        windDirection: data.wind_direction || null,
        temperature,
        humidity,
        batteryLevel,
        signalStrength,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .returning();

    // Check for alerts based on the telemetry data
    const telemetryForAlerts = {
      windSpeed: data.wind_speed ? parseFloat(data.wind_speed) : undefined,
      temperature: data.temperature ? parseFloat(data.temperature) : undefined,
      humidity: data.humidity ? parseFloat(data.humidity) : undefined,
      batteryLevel: metadata?.battery ? parseFloat(metadata.battery) : undefined,
      signalStrength: metadata?.signal || undefined,
    };

    const alerts = await processTelemetryForAlerts(deviceRecord.id, telemetryForAlerts, new Date());

    // Update device status with alert information
    await updateDeviceStatusWithAlerts(deviceRecord.id, alerts);

    // Update device's last seen
    await db
      .update(devices)
      .set({ lastSeen: new Date() })
      .where(eq(devices.id, deviceRecord.id));

    // In a real application, here you would trigger notification systems
    // for critical or important alerts (email, SMS, etc.)

    return Response.json({
      success: true,
      telemetryId: newTelemetry.id,
      alerts: alerts.length > 0 ? alerts : undefined, // Include alerts in response if any were generated
    });
  } catch (error) {
    console.error('Error receiving telemetry data:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}