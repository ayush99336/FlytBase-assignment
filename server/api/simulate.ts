import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Helper to check if a value is a GeoJSON LineString
function isLineString(obj: any): obj is { type: string; coordinates: number[][] } {
  return obj && typeof obj === "object" && obj.type === "LineString" && Array.isArray(obj.coordinates);
}

// POST /api/simulate/telemetry - Simulate telemetry for a random active mission
router.post("/telemetry", async (req, res) => {
  const activeMissions = await storage.getActiveMissions();
  if (activeMissions.length === 0) return res.status(404).json({ message: "No active missions" });
  const mission = activeMissions[Math.floor(Math.random() * activeMissions.length)];
  let flightPath = mission.flightPath;
  if (typeof flightPath === "string") {
    try { flightPath = JSON.parse(flightPath); } catch { return res.status(400).json({ message: "Invalid flightPath JSON" }); }
  }
  if (!isLineString(flightPath) || !mission.altitude) return res.status(400).json({ message: "Mission missing valid flight path or altitude" });
  const coords = flightPath.coordinates;
  const idx = Math.floor(Math.random() * coords.length);
  const [longitude, latitude] = coords[idx];
  const telemetry = await storage.createTelemetry({
    missionId: mission.id,
    altitude: mission.altitude,
    speed: mission.speed ?? 10,
    batteryLevel: Math.max(10, 100 - mission.progress),
    latitude,
    longitude,
    distanceTraveled: idx * 10,
    signalStrength: Math.floor(80 + Math.random() * 20),
    timestamp: new Date(),
  });
  res.json({ message: "Simulated telemetry", telemetry });
});

// POST /api/simulate/log - Simulate a log entry for a random active mission
router.post("/log", async (req, res) => {
  const activeMissions = await storage.getActiveMissions();
  if (activeMissions.length === 0) return res.status(404).json({ message: "No active missions" });
  const mission = activeMissions[Math.floor(Math.random() * activeMissions.length)];
  const log = await storage.createMissionLog({
    missionId: mission.id,
    logType: "INFO",
    message: req.body.message || "Simulated log entry",
    timestamp: new Date(),
  });
  res.json({ message: "Simulated log", log });
});

export default router;