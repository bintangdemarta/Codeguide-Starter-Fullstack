import { NextRequest } from 'next/server';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { devices, telemetryData } from '../../../db/schema/wind-dashboard';
import { z } from 'zod';
import { requireUserAuth } from '../../../lib/auth-middleware';

const queryParamsSchema = z.object({
  deviceId: z.string().optional(),
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
      fromDate: url.searchParams.get('fromDate'),
      toDate: url.searchParams.get('toDate'),
    });

    if (!queryParams.success) {
      return Response.json(
        { error: 'Invalid query parameters', details: queryParams.error.flatten() },
        { status: 400 }
      );
    }

    const { deviceId, fromDate, toDate } = queryParams.data;

    // Build base query for telemetry data with device info, filtered by user
    let query = db
      .select({
        deviceId: devices.id,
        deviceCode: devices.deviceCode,
        location: devices.location,
        windSpeed: telemetryData.windSpeed,
        windDirection: telemetryData.windDirection,
        temperature: telemetryData.temperature,
        humidity: telemetryData.humidity,
        timestamp: telemetryData.timestamp,
      })
      .from(telemetryData)
      .innerJoin(devices, eq(telemetryData.deviceId, devices.id))
      .where(eq(devices.userId, authResult.user.id)) // Only allow access to user's devices
      .orderBy(desc(telemetryData.timestamp));

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
          conditions.push(lte(telemetryData.timestamp, toDateParsed));
        }
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    const rawTelemetry = await query;

    // Calculate aggregations
    const totalReadings = rawTelemetry.length;

    if (totalReadings === 0) {
      return Response.json({
        success: true,
        aggregations: {
          totalDevices: deviceId ? 1 : 0,
          totalReadings: 0,
          avgWindSpeed: 0,
          maxWindSpeed: 0,
          minWindSpeed: 0,
          avgTemperature: 0,
          avgHumidity: 0,
          avgWindDirection: 0,
          dataCompleteness: 0,
          timeRange: { start: null, end: null },
          hourlyTrends: [],
          dailyStats: [],
        }
      });
    }

    // Calculate basic aggregates
    const windSpeeds = rawTelemetry
      .map(t => parseFloat(t.windSpeed || '0'))
      .filter(val => !isNaN(val));

    const temperatures = rawTelemetry
      .map(t => parseFloat(t.temperature || '0'))
      .filter(val => !isNaN(val));

    const humidities = rawTelemetry
      .map(t => parseFloat(t.humidity || '0'))
      .filter(val => !isNaN(val));

    const windDirections = rawTelemetry
      .map(t => parseInt(t.windDirection?.toString() || '0', 10))
      .filter(val => !isNaN(val));

    // Calculate statistics
    const avgWindSpeed = windSpeeds.length > 0
      ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
      : 0;

    const maxWindSpeed = windSpeeds.length > 0 ? Math.max(...windSpeeds) : 0;
    const minWindSpeed = windSpeeds.length > 0 ? Math.min(...windSpeeds) : 0;

    const avgTemperature = temperatures.length > 0
      ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length
      : 0;

    const avgHumidity = humidities.length > 0
      ? humidities.reduce((a, b) => a + b, 0) / humidities.length
      : 0;

    const avgWindDirection = windDirections.length > 0
      ? windDirections.reduce((a, b) => a + b, 0) / windDirections.length
      : 0;

    // Calculate time range
    const timestamps = rawTelemetry.map(t => new Date(t.timestamp));
    const timeRange = {
      start: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))).toISOString() : null,
      end: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))).toISOString() : null,
    };

    // Calculate data completeness (percentage of hours with data)
    if (timeRange.start && timeRange.end) {
      const start = new Date(timeRange.start);
      const end = new Date(timeRange.end);
      const totalHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      const dataPointsPerHour = new Set(
        rawTelemetry.map(t =>
          new Date(t.timestamp).toISOString().substring(0, 13) // YYYY-MM-DDTHH
        )
      ).size;

      const dataCompleteness = totalHours > 0 ? (dataPointsPerHour / totalHours) * 100 : 0;
    } else {
      var dataCompleteness = 0;
    }

    // Group by hour for trends
    const hourlyTrends = rawTelemetry.reduce((acc: any[], record) => {
      const hour = new Date(record.timestamp).toISOString().substring(0, 13); // YYYY-MM-DDTHH
      const existing = acc.find(item => item.hour === hour);

      if (existing) {
        existing.windSpeed.push(parseFloat(record.windSpeed || '0'));
        existing.temperature.push(parseFloat(record.temperature || '0'));
        existing.humidity.push(parseFloat(record.humidity || '0'));
      } else {
        acc.push({
          hour,
          windSpeed: [parseFloat(record.windSpeed || '0')],
          temperature: [parseFloat(record.temperature || '0')],
          humidity: [parseFloat(record.humidity || '0')],
        });
      }

      return acc;
    }, []);

    // Calculate averages for each hour
    const hourlyAvgTrends = hourlyTrends.map(trend => ({
      hour: trend.hour,
      avgWindSpeed: trend.windSpeed.length > 0
        ? trend.windSpeed.reduce((a: number, b: number) => a + b, 0) / trend.windSpeed.length
        : 0,
      avgTemperature: trend.temperature.length > 0
        ? trend.temperature.reduce((a: number, b: number) => a + b, 0) / trend.temperature.length
        : 0,
      avgHumidity: trend.humidity.length > 0
        ? trend.humidity.reduce((a: number, b: number) => a + b, 0) / trend.humidity.length
        : 0,
    }));

    // Calculate daily stats
    const dailyStats = rawTelemetry.reduce((acc: any[], record) => {
      const day = new Date(record.timestamp).toISOString().substring(0, 10); // YYYY-MM-DD
      const existing = acc.find(item => item.day === day);

      if (existing) {
        existing.windSpeed.push(parseFloat(record.windSpeed || '0'));
        existing.temperature.push(parseFloat(record.temperature || '0'));
        existing.humidity.push(parseFloat(record.humidity || '0'));
      } else {
        acc.push({
          day,
          windSpeed: [parseFloat(record.windSpeed || '0')],
          temperature: [parseFloat(record.temperature || '0')],
          humidity: [parseFloat(record.humidity || '0')],
        });
      }

      return acc;
    }, []);

    // Calculate daily averages
    const dailyAvgStats = dailyStats.map(stat => ({
      day: stat.day,
      avgWindSpeed: stat.windSpeed.length > 0
        ? stat.windSpeed.reduce((a: number, b: number) => a + b, 0) / stat.windSpeed.length
        : 0,
      maxWindSpeed: stat.windSpeed.length > 0 ? Math.max(...stat.windSpeed) : 0,
      minWindSpeed: stat.windSpeed.length > 0 ? Math.min(...stat.windSpeed) : 0,
      avgTemperature: stat.temperature.length > 0
        ? stat.temperature.reduce((a: number, b: number) => a + b, 0) / stat.temperature.length
        : 0,
      avgHumidity: stat.humidity.length > 0
        ? stat.humidity.reduce((a: number, b: number) => a + b, 0) / stat.humidity.length
        : 0,
    }));

    return Response.json({
      success: true,
      aggregations: {
        totalDevices: new Set(rawTelemetry.map(t => t.deviceId)).size,
        totalReadings,
        avgWindSpeed: parseFloat(avgWindSpeed.toFixed(2)),
        maxWindSpeed: parseFloat(maxWindSpeed.toFixed(2)),
        minWindSpeed: parseFloat(minWindSpeed.toFixed(2)),
        avgTemperature: parseFloat(avgTemperature.toFixed(2)),
        avgHumidity: parseFloat(avgHumidity.toFixed(2)),
        avgWindDirection: parseFloat(avgWindDirection.toFixed(2)),
        dataCompleteness: parseFloat(dataCompleteness.toFixed(2)),
        timeRange,
        hourlyTrends: hourlyAvgTrends,
        dailyStats: dailyAvgStats,
      }
    });
  } catch (error) {
    console.error('Error getting aggregated analytics:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}