import { NextRequest } from 'next/server';
import { eq, desc, and, gte } from 'drizzle-orm';
import { db } from '../../../../db';
import { devices, telemetryData } from '../../../../db/schema/wind-dashboard';
import { z } from 'zod';
import { requireUserAuth } from '../../../../lib/auth-middleware';

const queryParamsSchema = z.object({
  deviceId: z.string().optional(),
  limit: z.string().optional().default('50'),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
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
      limit: url.searchParams.get('limit'),
      fromDate: url.searchParams.get('fromDate'),
      toDate: url.searchParams.get('toDate'),
    });

    if (!queryParams.success) {
      return Response.json(
        { error: 'Invalid query parameters', details: queryParams.error.flatten() },
        { status: 400 }
      );
    }

    const { deviceId, limit, fromDate, toDate } = queryParams.data;

    // Validate limit
    const limitNum = Math.min(parseInt(limit || '50', 10), 1000); // Max 1000 records

    // Build query joining telemetry with devices to check user ownership
    let query = db
      .select({
        id: telemetryData.id,
        deviceId: telemetryData.deviceId,
        deviceCode: devices.deviceCode,
        timestamp: telemetryData.timestamp,
        windSpeed: telemetryData.windSpeed,
        windDirection: telemetryData.windDirection,
        temperature: telemetryData.temperature,
        humidity: telemetryData.humidity,
        batteryLevel: telemetryData.batteryLevel,
        signalStrength: telemetryData.signalStrength,
        metadata: telemetryData.metadata,
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

    if (fromDate || toDate) {
      const conditions = [];

      if (fromDate) {
        const fromDateParsed = new Date(fromDate);
        if (!isNaN(fromDateParsed.getTime())) {
          conditions.push(gte(telemetryData.timestamp, fromDateParsed));
        }
      }

      if (toDate) {
        const toDateParsed = new Date(toDate);
        if (!isNaN(toDateParsed.getTime())) {
          conditions.push(gte(telemetryData.timestamp, toDateParsed));
        }
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    const telemetryList = await query;

    return Response.json({
      success: true,
      telemetry: telemetryList,
    });
  } catch (error) {
    console.error('Error getting telemetry data:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}