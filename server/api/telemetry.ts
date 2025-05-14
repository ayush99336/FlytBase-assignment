import { Router } from "express";
import { storage } from "../storage";

const router = Router();

router.get("/missions/:id/telemetry", async (req, res) => {
  const missionId = parseInt(req.params.id);
  const telemetry = await storage.getTelemetryByMissionId(missionId);
  res.json(telemetry);
});

export default router;
