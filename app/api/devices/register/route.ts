import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../db';
import { devices, deviceStatus } from '../../../../../db/schema/wind-dashboard';
import { requireUserAuth } from '../../../../../lib/auth-middleware';

export async function POST(request: NextRequest) {
  // Authenticate user
  const authResult = await requireUserAuth(request);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const body = await request.json();

    const { deviceCode, location, firmwareVersion } = body;

    if (!deviceCode) {
      return Response.json(
        { error: 'Device code is required' },
        { status: 400 }
      );
    }

    // Check if device already exists
    const existingDevice = await db
      .select()
      .from(devices)
      .where(eq(devices.deviceCode, deviceCode))
      .limit(1);

    if (existingDevice.length > 0) {
      return Response.json(
        { error: 'Device with this code already exists' },
        { status: 409 }
      );
    }

    // Create new device - associate with authenticated user
    const [newDevice] = await db
      .insert(devices)
      .values({
        deviceCode,
        location: JSON.stringify(location),
        firmwareVersion,
        installationDate: new Date(),
        status: 'active',
        userId: authResult.user.id, // Associate with authenticated user
        lastSeen: new Date(),
      })
      .returning();

    // Create initial device status
    await db
      .insert(deviceStatus)
      .values({
        deviceId: newDevice.id,
        onlineStatus: true,
        lastTransmission: new Date(),
        errorCodes: [],
        batteryLevel: 100, // New device starts with full battery
        signalStrength: -50, // Good signal strength for new device
      });

    return Response.json({
      success: true,
      device: newDevice,
    });
  } catch (error) {
    console.error('Error registering device:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}