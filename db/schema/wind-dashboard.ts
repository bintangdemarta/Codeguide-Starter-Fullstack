import { pgTable, serial, text, integer, decimal, timestamp, boolean, uuid, jsonb, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceCode: text("device_code").notNull().unique(),
  location: text("location"), // This would be a geometry type in actual PostgreSQL
  installationDate: timestamp("installation_date"),
  status: text("status").default("active"),
  firmwareVersion: text("firmware_version"),
  lastSeen: timestamp("last_seen"),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Note: Not adding index on location field as it's a text field that may contain JSON
// For production, you might want to use a proper geometry type and appropriate index

export const telemetryData = pgTable("telemetry_data", {
  id: serial("id").primaryKey(),
  deviceId: uuid("device_id").notNull().references(() => devices.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  windSpeed: decimal("wind_speed", { precision: 5, scale: 2 }), // In m/s or km/h
  windDirection: integer("wind_direction"), // In degrees (0-360)
  temperature: decimal("temperature", { precision: 4, scale: 2 }), // In Celsius
  humidity: decimal("humidity", { precision: 4, scale: 2 }), // Percentage
  batteryLevel: decimal("battery_level", { precision: 3, scale: 1 }), // Percentage
  signalStrength: integer("signal_strength"), // RSSI in dBm
  metadata: jsonb("metadata"), // Additional sensor data as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deviceStatus = pgTable("device_status", {
  deviceId: uuid("device_id").primaryKey().references(() => devices.id, { onDelete: "cascade" }),
  onlineStatus: boolean("online_status").default(false),
  lastTransmission: timestamp("last_transmission"),
  errorCodes: jsonb("error_codes"), // JSON array of error codes
  maintenanceCount: integer("maintenance_count").default(0),
  batteryLevel: decimal("battery_level", { precision: 3, scale: 1 }), // Percentage
  signalStrength: integer("signal_strength"), // RSSI in dBm
  lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});