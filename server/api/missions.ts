import { Router } from "express";
import { storage } from "../storage";
import { insertMissionSchema, updateMissionStatusSchema, updateMissionProgressSchema } from "@shared/schema";

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
    });
    res.status(201).json(mission);
  } catch (error) {
    res.status(400).json({ message: "Invalid mission data" });
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
