import { Router } from "express";
import { storage } from "../storage";
import { insertDroneSchema } from "@shared/schema";
import { Prisma } from "@prisma/client";

const router = Router();

router.get("/", async (req, res) => {
  const drones = await storage.getDrones();
  res.json(drones);
});

router.get("/:id", async (req, res) => {
  const drone = await storage.getDroneById(parseInt(req.params.id));
  if (!drone) {
    return res.status(404).json({ message: "Drone not found" });
  }
  res.json(drone);
});

router.post("/", async (req, res) => {
  try {
    const droneData = insertDroneSchema.parse(req.body);
    const drone = await storage.createDrone({
      ...droneData,
      flightHours: new Prisma.Decimal(droneData.flightHours ?? 0),
      lastMissionId: droneData.lastMissionId ?? null,
    });
    res.status(201).json(drone);
  } catch (error) {
    res.status(400).json({ message: "Invalid drone data" });
  }
});

export default router;
