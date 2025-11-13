import { db } from '@/db';
import { telemetryData, deviceStatus, devices } from '@/db/schema/wind-dashboard';
import { eq, desc, and, gte } from 'drizzle-orm';
import { z } from 'zod';

// Define alert thresholds
const ALERT_THRESHOLDS = {
  windSpeed: {
    warning: 20, // m/s
    critical: 30 // m/s
  },
  temperature: {
    warning: 35, // Celsius
    critical: 40 // Celsius
  },
  battery: {
    warning: 20, // percentage
    critical: 10 // percentage
  },
  signal: {
    warning: -80, // dBm
    critical: -90 // dBm
  }
};

export interface Alert {
  type: string;
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  deviceId: string;
  timestamp: Date;
}

export interface AlertConfig {
  windSpeedWarning?: number;
  windSpeedCritical?: number;
  temperatureWarning?: number;
  temperatureCritical?: number;
  batteryWarning?: number;
  batteryCritical?: number;
  signalWarning?: number;
  signalCritical?: number;
}

/**
 * Checks telemetry data against alert thresholds and generates alerts
 */
export async function processTelemetryForAlerts(
  deviceId: string, 
  telemetry: {
    windSpeed?: number;
    temperature?: number;
    humidity?: number;
    batteryLevel?: number;
    signalStrength?: number;
  },
  timestamp: Date = new Date()
): Promise<Alert[]> {
  const alerts: Alert[] = [];

  // Check wind speed
  if (telemetry.windSpeed !== undefined) {
    if (telemetry.windSpeed >= ALERT_THRESHOLDS.windSpeed.critical) {
      alerts.push({
        type: 'EXTREME_WIND_SPEED',
        severity: 'critical',
        message: `Extreme wind speed detected: ${telemetry.windSpeed} m/s`,
        value: telemetry.windSpeed,
        threshold: ALERT_THRESHOLDS.windSpeed.critical,
        deviceId,
        timestamp
      });
    } else if (telemetry.windSpeed >= ALERT_THRESHOLDS.windSpeed.warning) {
      alerts.push({
        type: 'HIGH_WIND_SPEED',
        severity: 'warning',
        message: `High wind speed detected: ${telemetry.windSpeed} m/s`,
        value: telemetry.windSpeed,
        threshold: ALERT_THRESHOLDS.windSpeed.warning,
        deviceId,
        timestamp
      });
    }
  }

  // Check temperature
  if (telemetry.temperature !== undefined) {
    if (telemetry.temperature >= ALERT_THRESHOLDS.temperature.critical) {
      alerts.push({
        type: 'EXTREME_TEMPERATURE',
        severity: 'critical',
        message: `Extreme temperature detected: ${telemetry.temperature} °C`,
        value: telemetry.temperature,
        threshold: ALERT_THRESHOLDS.temperature.critical,
        deviceId,
        timestamp
      });
    } else if (telemetry.temperature >= ALERT_THRESHOLDS.temperature.warning) {
      alerts.push({
        type: 'HIGH_TEMPERATURE',
        severity: 'warning',
        message: `High temperature detected: ${telemetry.temperature} °C`,
        value: telemetry.temperature,
        threshold: ALERT_THRESHOLDS.temperature.warning,
        deviceId,
        timestamp
      });
    }
  }

  // Check battery level
  if (telemetry.batteryLevel !== undefined) {
    if (telemetry.batteryLevel <= ALERT_THRESHOLDS.battery.critical) {
      alerts.push({
        type: 'CRITICAL_BATTERY',
        severity: 'critical',
        message: `Critical battery level: ${telemetry.batteryLevel}%`,
        value: telemetry.batteryLevel,
        threshold: ALERT_THRESHOLDS.battery.critical,
        deviceId,
        timestamp
      });
    } else if (telemetry.batteryLevel <= ALERT_THRESHOLDS.battery.warning) {
      alerts.push({
        type: 'LOW_BATTERY',
        severity: 'warning',
        message: `Low battery detected: ${telemetry.batteryLevel}%`,
        value: telemetry.batteryLevel,
        threshold: ALERT_THRESHOLDS.battery.warning,
        deviceId,
        timestamp
      });
    }
  }

  // Check signal strength
  if (telemetry.signalStrength !== undefined) {
    if (telemetry.signalStrength <= ALERT_THRESHOLDS.signal.critical) {
      alerts.push({
        type: 'CRITICAL_SIGNAL',
        severity: 'critical',
        message: `Critical signal strength: ${telemetry.signalStrength} dBm`,
        value: telemetry.signalStrength,
        threshold: ALERT_THRESHOLDS.signal.critical,
        deviceId,
        timestamp
      });
    } else if (telemetry.signalStrength <= ALERT_THRESHOLDS.signal.warning) {
      alerts.push({
        type: 'POOR_SIGNAL',
        severity: 'warning',
        message: `Poor signal strength: ${telemetry.signalStrength} dBm`,
        value: telemetry.signalStrength,
        threshold: ALERT_THRESHOLDS.signal.warning,
        deviceId,
        timestamp
      });
    }
  }

  return alerts;
}

/**
 * Checks recent telemetry data for devices to identify new alerts
 */
export async function checkForNewAlerts(): Promise<Alert[]> {
  try {
    // Get telemetry from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const recentTelemetry = await db
      .select({
        id: telemetryData.id,
        deviceId: telemetryData.deviceId,
        timestamp: telemetryData.timestamp,
        windSpeed: telemetryData.windSpeed,
        temperature: telemetryData.temperature,
        humidity: telemetryData.humidity,
        batteryLevel: telemetryData.batteryLevel,
        signalStrength: telemetryData.signalStrength,
      })
      .from(telemetryData)
      .where(gte(telemetryData.timestamp, fiveMinutesAgo))
      .orderBy(desc(telemetryData.timestamp));
    
    let allAlerts: Alert[] = [];
    
    for (const record of recentTelemetry) {
      const telemetry = {
        windSpeed: record.windSpeed ? parseFloat(record.windSpeed) : undefined,
        temperature: record.temperature ? parseFloat(record.temperature) : undefined,
        humidity: record.humidity ? parseFloat(record.humidity) : undefined,
        batteryLevel: record.batteryLevel ? parseFloat(record.batteryLevel) : undefined,
        signalStrength: record.signalStrength || undefined,
      };
      
      const recordAlerts = await processTelemetryForAlerts(
        record.deviceId,
        telemetry,
        record.timestamp
      );
      
      allAlerts = allAlerts.concat(recordAlerts);
    }
    
    return allAlerts;
  } catch (error) {
    console.error('Error checking for new alerts:', error);
    throw error;
  }
}

/**
 * Generates a summary of alert statistics
 */
export async function getAlertSummary(): Promise<{
  totalCritical: number;
  totalWarning: number;
  activeDevicesWithAlerts: number;
  recentAlerts: Alert[];
}> {
  try {
    const alerts = await checkForNewAlerts();
    
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    const warningAlerts = alerts.filter(alert => alert.severity === 'warning');
    const devicesWithAlerts = new Set(alerts.map(alert => alert.deviceId)).size;
    
    return {
      totalCritical: criticalAlerts.length,
      totalWarning: warningAlerts.length,
      activeDevicesWithAlerts: devicesWithAlerts,
      recentAlerts: alerts.slice(0, 10) // Return only the 10 most recent
    };
  } catch (error) {
    console.error('Error getting alert summary:', error);
    throw error;
  }
}

/**
 * Updates device status based on alerts
 */
export async function updateDeviceStatusWithAlerts(deviceId: string, alerts: Alert[]): Promise<void> {
  try {
    // Get existing device status or create new one
    const existingStatus = await db
      .select()
      .from(deviceStatus)
      .where(eq(deviceStatus.deviceId, deviceId))
      .limit(1);
    
    const hasCriticalAlerts = alerts.some(alert => alert.severity === 'critical');
    const hasWarnings = alerts.some(alert => alert.severity === 'warning');
    
    // Determine health status based on alerts
    let healthStatus: 'good' | 'warning' | 'critical' = 'good';
    if (hasCriticalAlerts) {
      healthStatus = 'critical';
    } else if (hasWarnings) {
      healthStatus = 'warning';
    }
    
    // Update or insert device status
    if (existingStatus.length > 0) {
      await db
        .update(deviceStatus)
        .set({
          lastTransmission: new Date(),
          errorCodes: JSON.stringify(alerts.map(alert => alert.type)),
          updatedAt: new Date(),
        })
        .where(eq(deviceStatus.deviceId, deviceId));
    } else {
      await db.insert(deviceStatus).values({
        deviceId,
        onlineStatus: true,
        lastTransmission: new Date(),
        errorCodes: JSON.stringify(alerts.map(alert => alert.type)),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating device status with alerts:', error);
    throw error;
  }
}