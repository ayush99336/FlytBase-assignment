import { Router } from "express";
import { storage } from "../storage";
import { insertMissionSchema, updateMissionStatusSchema, updateMissionProgressSchema } from "@shared/schema";
import { faker } from '@faker-js/faker';

const router = Router();

router.get("/", async (req, res) => {
  const missions = await storage.getMissions();
  res.json(missions);
});

router.get("/active", async (req, res) => {
  const missions = await storage.getActiveMissions();
  res.json(missions);
});

router.get("/:id", async (req, res) => {
  const mission = await storage.getMissionById(parseInt(req.params.id));
  if (!mission) {
    return res.status(404).json({ message: "Mission not found" });
  }
  res.json(mission);
});

router.post("/", async (req, res) => {
  try {
    const missionData = insertMissionSchema.parse(req.body);
    const mission = await storage.createMission({
      ...missionData,
      droneId: missionData.droneId ?? null,
      createdAt: missionData.createdAt ?? new Date(),
      scheduledAt: missionData.scheduledAt ?? null,
      startedAt: missionData.startedAt ?? null,
      completedAt: missionData.completedAt ?? null,
      duration: missionData.duration ?? null,
      actualPath: missionData.actualPath ?? null,
      altitude: missionData.altitude ?? null,
      speed: missionData.speed ?? null,
      imageOverlap: missionData.imageOverlap ?? null,
      patternType: missionData.patternType ?? null,
      // New fields
      dataFrequency: missionData.dataFrequency ?? null,
      sensors: missionData.sensors ?? [],
      waypoints: missionData.waypoints ?? null
    });
    res.status(201).json(mission);
  } catch (error) {
    res.status(400).json({ message: "Invalid mission data" });
  }
});

router.post("/simulate", async (req, res) => {
  try {
    // Get available drones
    const drones = await storage.getDrones();
    const availableDrones = drones.filter(d => d.status === 'Available' && d.currentBatteryLevel > 30);
    const drone = availableDrones.length > 0 ? faker.helpers.arrayElement(availableDrones) : null;

    // Generate random coordinates for a simple LineString path
    const baseLat = faker.location.latitude({ min: 28, max: 29 });
    const baseLng = faker.location.longitude({ min: 76, max: 77 });
    const coordinates = Array.from({ length: 10 }, (_, i) => [
      baseLng + i * 0.001 + faker.number.float({ min: -0.0005, max: 0.0005 }),
      baseLat + i * 0.001 + faker.number.float({ min: -0.0005, max: 0.0005 })
    ]);
    const flightPath = { type: 'LineString', coordinates };

    // Create the mission
    const missionData = {
      name: faker.company.name() + ' Survey',
      missionType: faker.helpers.arrayElement(['Site Survey', 'Inspection', 'Mapping']),
      status: faker.helpers.arrayElement(['Planned', 'Pending', 'In Progress', 'Completed']),
      location: faker.location.city() + ', ' + faker.location.country(),
      area: faker.number.float({ min: 10000, max: 100000 }),
      droneId: drone ? drone.id : null,
      createdAt: new Date(),
      scheduledAt: faker.date.soon({ days: 7 }),
      startedAt: null,
      completedAt: null,
      duration: null,
      flightPath,
      actualPath: null,
      progress: 0,
      altitude: faker.number.int({ min: 50, max: 120 }),
      speed: faker.number.int({ min: 5, max: 15 }),
      imageOverlap: faker.number.int({ min: 60, max: 90 }),
      patternType: faker.helpers.arrayElement(['Grid', 'Perimeter', 'Crosshatch', 'Spiral'])
    };
    const mission = await storage.createMission(missionData);

    // Optionally, create some telemetry and logs
    for (let i = 0; i < 5; i++) {
      await storage.createTelemetry({
        missionId: mission.id,
        altitude: mission.altitude,
        speed: mission.speed,
        batteryLevel: faker.number.int({ min: 20, max: 100 }),
        latitude: coordinates[i][1],
        longitude: coordinates[i][0],
        distanceTraveled: i * 100,
        signalStrength: faker.number.int({ min: 60, max: 100 }),
        timestamp: new Date(Date.now() - (5 - i) * 60000)
      });
      await storage.createMissionLog({
        missionId: mission.id,
        logType: faker.helpers.arrayElement(['INFO', 'WARN', 'ERROR']),
        message: faker.lorem.sentence(),
        timestamp: new Date(Date.now() - (5 - i) * 60000)
      });
    }

    res.status(201).json({ message: 'Simulated mission created', mission });
  } catch (error) {
    res.status(500).json({ message: 'Failed to simulate mission', error: error.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = updateMissionStatusSchema.parse(req.body);
    const mission = await storage.updateMissionStatus(id, updateData);
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }
    res.json(mission);
  } catch (error) {
    res.status(400).json({ message: "Invalid status update" });
  }
});

router.patch("/:id/progress", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = updateMissionProgressSchema.parse(req.body);
    const mission = await storage.updateMissionProgress(id, updateData);
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }
    res.json(mission);
  } catch (error) {
    res.status(400).json({ message: "Invalid progress update" });
  }
});

export default router;
