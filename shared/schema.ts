import { z } from "zod";

// Prisma-compatible schemas for validation only
export const insertDroneSchema = z.object({
  name: z.string(),
  model: z.string(),
  serialNumber: z.string(),
  batteryCapacity: z.number(),
  currentBatteryLevel: z.number(),
  status: z.string(),
  location: z.string(),
  flightHours: z.union([z.string(), z.number()]),
  healthStatus: z.string().optional(),
  lastMissionId: z.number().optional().nullable(),
});

export const insertMissionSchema = z.object({
  name: z.string(),
  missionType: z.string(),
  status: z.string(),
  location: z.string(),
  area: z.number(),
  droneId: z.number().optional().nullable(),
  createdAt: z.date().optional(),
  // Accept ISO string or Date for scheduledAt
  scheduledAt: z.coerce.date().optional().nullable(),
  startedAt: z.date().optional().nullable(),
  completedAt: z.date().optional().nullable(),
  duration: z.number().optional().nullable(),
  flightPath: z.any(),
  actualPath: z.any().optional().nullable(),
  progress: z.number().optional(),
  altitude: z.number().optional().nullable(),
  speed: z.number().optional().nullable(),
  imageOverlap: z.number().optional().nullable(),
  patternType: z.string().optional().nullable(),
  // New fields for configuration
  dataFrequency: z.number().min(1).max(60).optional(),
  sensors: z.array(z.string()).optional(),
  waypoints: z.any().optional(),
});

export const insertTelemetrySchema = z.object({
  missionId: z.number(),
  timestamp: z.date().optional(),
  altitude: z.number().optional().nullable(),
  speed: z.number().optional().nullable(),
  batteryLevel: z.number().optional().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  distanceTraveled: z.number().optional().nullable(),
  signalStrength: z.number().optional().nullable(),
});

export const insertMissionLogSchema = z.object({
  missionId: z.number(),
  timestamp: z.date().optional(),
  logType: z.string(),
  message: z.string(),
});

export const insertBatteryLogSchema = z.object({
  droneId: z.number(),
  missionId: z.number().optional().nullable(),
  startLevel: z.number(),
  endLevel: z.number(),
  cycleCount: z.number(),
  usageDate: z.date().optional(),
});

export const updateMissionStatusSchema = z.object({
  status: z.enum(["Planned", "In Progress", "Completed", "Aborted", "Paused"]),
});

export const updateMissionProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  actualPath: z.any().optional(),
});

export type UpdateMissionStatus = z.infer<typeof updateMissionStatusSchema>;
export type UpdateMissionProgress = z.infer<typeof updateMissionProgressSchema>;
export type Drone = z.infer<typeof insertDroneSchema>;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type MissionLog = z.infer<typeof insertMissionLogSchema>;
export type Telemetry = z.infer<typeof insertTelemetrySchema>;
export type BatteryLog = z.infer<typeof insertBatteryLogSchema>;
