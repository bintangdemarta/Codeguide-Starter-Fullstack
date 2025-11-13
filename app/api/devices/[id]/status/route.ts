import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../../db';
import { devices, deviceStatus } from '../../../../../../db/schema/wind-dashboard';
import { requireUserAuth } from '../../../../../../lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate user
  const authResult = await requireUserAuth(request);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const deviceId = params.id;

    if (!deviceId) {
      return Response.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    // Find device by ID or device code
    let device;
    if (deviceId.length > 30) { // UUID length
      device = await db
        .select()
        .from(devices)
        .where(eq(devices.id, deviceId))
        .limit(1);
    } else { // Assume it's a device code
      device = await db
        .select()
        .from(devices)
        .where(eq(devices.deviceCode, deviceId))
        .limit(1);
    }

    if (device.length === 0) {
      return Response.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const deviceRecord = device[0];

    // Check if user has access to this device
    if (deviceRecord.userId !== authResult.user.id) {
      return Response.json(
        { error: 'Unauthorized to access this device' },
        { status: 403 }
      );
    }

    // Get device status
    const status = await db
      .select()
      .from(deviceStatus)
      .where(eq(deviceStatus.deviceId, deviceRecord.id))
      .limit(1);

    return Response.json({
      success: true,
      device: {
        id: deviceRecord.id,
        deviceCode: deviceRecord.deviceCode,
        location: deviceRecord.location,
        status: deviceRecord.status,
        firmwareVersion: deviceRecord.firmwareVersion,
        lastSeen: deviceRecord.lastSeen,
      },
      status: status.length > 0 ? status[0] : null,
    });
  } catch (error) {
    console.error('Error getting device status:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}