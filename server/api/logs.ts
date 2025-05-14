import { Router } from "express";
import { storage } from "../storage";

const router = Router();

router.get("/missions/:id/logs", async (req, res) => {
  const missionId = parseInt(req.params.id);
  const logs = await storage.getMissionLogsByMissionId(missionId);
  res.json(logs);
});

router.post("/missions/:id/logs", async (req, res) => {
  try {
    const missionId = parseInt(req.params.id);
    const logData = { ...req.body, missionId, timestamp: new Date() };
    const log = await storage.createMissionLog(logData);
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ message: "Invalid log data" });
  }
});

export default router;
