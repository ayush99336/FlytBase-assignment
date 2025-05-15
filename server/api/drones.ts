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
      healthStatus: droneData.healthStatus ?? "",
    });
    res.status(201).json(drone);
  } catch (error) {
    res.status(400).json({ message: "Invalid drone data" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const drone = await storage.getDroneById(id);
    if (!drone) {
      return res.status(404).json({ message: "Drone not found" });
    }

    // Convert flightHours to Decimal if present
    let updateData = req.body;
    if (updateData.flightHours !== undefined) {
      updateData.flightHours = new Prisma.Decimal(updateData.flightHours);
    }

    const updatedDrone = await storage.updateDrone(id, updateData);
    res.json(updatedDrone);
  } catch (error) {
    res.status(400).json({ message: "Failed to update drone" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const drone = await storage.getDroneById(id);
    if (!drone) {
      return res.status(404).json({ message: "Drone not found" });
    }

    await storage.deleteDrone(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: "Failed to delete drone" });
  }
});

export default router;
