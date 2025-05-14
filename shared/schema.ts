import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Drone model
export const drones = pgTable("drones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  serialNumber: text("serial_number").notNull().unique(),
  batteryCapacity: integer("battery_capacity").notNull(), // Percentage
  currentBatteryLevel: integer("current_battery_level").notNull(), // Percentage
  status: text("status").notNull(), // Available, In Mission, Charging, Maintenance
  location: text("location").notNull(),
  flightHours: decimal("flight_hours", { precision: 10, scale: 2 }).notNull().default("0"),
  healthStatus: text("health_status").notNull().default("good"), // Good, Fair, Poor
  lastMission: integer("last_mission").references(() => missions.id),
});

// Mission model
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  missionType: text("mission_type").notNull(), // Site Survey, Building Inspection, etc.
  status: text("status").notNull(), // Planned, In Progress, Completed, Aborted
  location: text("location").notNull(),
  area: real("area").notNull(), // Area in square meters
  droneId: integer("drone_id").references(() => drones.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // Duration in seconds
  flightPath: json("flight_path").notNull(), // GeoJSON of the planned path
  actualPath: json("actual_path"), // GeoJSON of the actual path
  progress: integer("progress").notNull().default(0), // Percentage complete
  altitude: integer("altitude"), // in meters
  speed: integer("speed"), // in m/s
  imageOverlap: integer("image_overlap"), // in percentage
  patternType: text("pattern_type"), // Grid, Perimeter, Crosshatch, Spiral
});

// Flight telemetry - for storing real-time data
export const telemetry = pgTable("telemetry", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id").references(() => missions.id).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  altitude: real("altitude"), // Current altitude in meters
  speed: real("speed"), // Current speed in m/s
  batteryLevel: integer("battery_level"), // Current battery level percentage
  latitude: real("latitude").notNull(), // Current latitude
  longitude: real("longitude").notNull(), // Current longitude
  distanceTraveled: real("distance_traveled"), // Distance traveled in meters
  signalStrength: integer("signal_strength"), // Signal strength percentage
});

// Mission logs for tracking events during missions
export const missionLogs = pgTable("mission_logs", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id").references(() => missions.id).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  logType: text("log_type").notNull(), // INFO, WARN, ERROR, START, END
  message: text("message").notNull(),
});

// Battery usage logs
export const batteryLogs = pgTable("battery_logs", {
  id: serial("id").primaryKey(),
  droneId: integer("drone_id").references(() => drones.id).notNull(),
  missionId: integer("mission_id").references(() => missions.id),
  startLevel: integer("start_level").notNull(),
  endLevel: integer("end_level").notNull(),
  cycleCount: integer("cycle_count").notNull(),
  usageDate: timestamp("usage_date").notNull().defaultNow(),
});

// Insert schemas
export const insertDroneSchema = createInsertSchema(drones).omit({
  id: true,
  lastMission: true
});

export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
  duration: true,
  actualPath: true,
  progress: true
});

export const insertTelemetrySchema = createInsertSchema(telemetry).omit({
  id: true,
  timestamp: true
});

export const insertMissionLogSchema = createInsertSchema(missionLogs).omit({
  id: true,
  timestamp: true
});

export const insertBatteryLogSchema = createInsertSchema(batteryLogs).omit({
  id: true,
  usageDate: true
});

// Types
export type Drone = typeof drones.$inferSelect;
export type InsertDrone = z.infer<typeof insertDroneSchema>;

export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;

export type Telemetry = typeof telemetry.$inferSelect;
export type InsertTelemetry = z.infer<typeof insertTelemetrySchema>;

export type MissionLog = typeof missionLogs.$inferSelect;
export type InsertMissionLog = z.infer<typeof insertMissionLogSchema>;

export type BatteryLog = typeof batteryLogs.$inferSelect;
export type InsertBatteryLog = z.infer<typeof insertBatteryLogSchema>;

// Additional schemas for API requests
export const updateMissionStatusSchema = z.object({
  status: z.enum(["Planned", "In Progress", "Completed", "Aborted", "Paused"]),
});

export const updateMissionProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  actualPath: z.any().optional(), // GeoJSON
});

export type UpdateMissionStatus = z.infer<typeof updateMissionStatusSchema>;
export type UpdateMissionProgress = z.infer<typeof updateMissionProgressSchema>;
