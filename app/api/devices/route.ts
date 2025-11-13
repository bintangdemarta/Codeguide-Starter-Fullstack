import { NextRequest } from 'next/server';
import { eq, and, gte } from 'drizzle-orm';
import { db } from '../../../../../db';
import { devices, deviceStatus } from '../../../../../db/schema/wind-dashboard';
import { requireUserAuth } from '../../../../../lib/auth-middleware';

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await requireUserAuth(request);
  if (!authResult.success) {
    return authResult;
  }

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    // Only allow users to see their own devices, unless they're requesting a specific user ID (for admin)
    // For now, we'll just show the current user's devices
    let deviceQuery = db.select().from(devices);

    // Filter by authenticated user
    deviceQuery = deviceQuery.where(eq(devices.userId, authResult.user.id));

    const deviceList = await deviceQuery.orderBy(devices.createdAt);

    // Get status for each device
    const devicesWithStatus = await Promise.all(
      deviceList.map(async (device) => {
        const status = await db
          .select()
          .from(deviceStatus)
          .where(eq(deviceStatus.deviceId, device.id))
          .limit(1);

        return {
          ...device,
          statusInfo: status.length > 0 ? status[0] : null,
        };
      })
    );

    return Response.json({
      success: true,
      devices: devicesWithStatus,
    });
  } catch (error) {
    console.error('Error getting devices:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}