import { PrismaClient, Drone, Mission, Telemetry, MissionLog, BatteryLog, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export interface UpdateMissionStatus {
  status: "Planned" | "In Progress" | "Completed" | "Aborted" | "Paused";
}

export interface UpdateMissionProgress {
  progress: number;
  actualPath?: any;
}

export interface IStorage {
  getDrones(): Promise<Drone[]>;
  getDroneById(id: number): Promise<Drone | null>;
  createDrone(drone: Omit<Drone, "id">): Promise<Drone>;
  updateDrone(id: number, drone: Partial<Drone>): Promise<Drone | null>;
  deleteDrone(id: number): Promise<Drone>;

  getMissions(): Promise<Mission[]>;
  getActiveMissions(): Promise<Mission[]>;
  getMissionById(id: number): Promise<Mission | null>;
  createMission(mission: Prisma.MissionCreateInput): Promise<Mission>;
  updateMissionStatus(id: number, update: UpdateMissionStatus): Promise<Mission | null>;
  updateMissionProgress(id: number, update: UpdateMissionProgress): Promise<Mission | null>;

  getTelemetryByMissionId(missionId: number): Promise<Telemetry[]>;
  createTelemetry(telemetry: Omit<Telemetry, "id">): Promise<Telemetry>;

  getMissionLogsByMissionId(missionId: number): Promise<MissionLog[]>;
  createMissionLog(log: Omit<MissionLog, "id">): Promise<MissionLog>;

  getBatteryLogsByDroneId(droneId: number): Promise<BatteryLog[]>;
  createBatteryLog(log: Omit<BatteryLog, "id">): Promise<BatteryLog>;

  seedData(): Promise<void>;
}

function toPrismaJson(val: any): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (val === undefined || val === null) return Prisma.JsonNull;
  return val;
}

export class DatabaseStorage implements IStorage {
  async getDrones() {
    return prisma.drone.findMany();
  }
  async getDroneById(id: number) {
    return prisma.drone.findUnique({ where: { id } });
  }
  async createDrone(drone: Omit<Drone, "id">) {
    return prisma.drone.create({ data: drone });
  }
  async updateDrone(id: number, drone: Partial<Drone>) {
    return prisma.drone.update({ where: { id }, data: drone });
  }
  async deleteDrone(id: number) {
    return prisma.drone.delete({ where: { id } });
  }

  async getMissions() {
    return prisma.mission.findMany();
  }
  async getActiveMissions() {
    return prisma.mission.findMany({ where: { status: "In Progress" } });
  }
  async getMissionById(id: number) {
    return prisma.mission.findUnique({ where: { id } });
  }
  async createMission(mission: Prisma.MissionCreateInput) {
    return prisma.mission.create({
      data: {
        ...mission,
        flightPath: toPrismaJson((mission as any).flightPath),
        actualPath: toPrismaJson((mission as any).actualPath),
        dataFrequency: (mission as any).dataFrequency ?? null,
        sensors: (mission as any).sensors ? toPrismaJson((mission as any).sensors) : undefined,
        waypoints: (mission as any).waypoints ? toPrismaJson((mission as any).waypoints) : undefined,
      },
    });
  }
  async updateMissionStatus(id: number, update: UpdateMissionStatus) {
    return prisma.mission.update({ where: { id }, data: { status: update.status } });
  }
  async updateMissionProgress(id: number, update: UpdateMissionProgress) {
    return prisma.mission.update({
      where: { id },
      data: {
        progress: update.progress,
        actualPath: toPrismaJson(update.actualPath),
      },
    });
  }

  async getTelemetryByMissionId(missionId: number) {
    return prisma.telemetry.findMany({ where: { missionId }, orderBy: { timestamp: "desc" } });
  }
  async createTelemetry(telemetry: Omit<Telemetry, "id">) {
    return prisma.telemetry.create({ data: telemetry });
  }

  async getMissionLogsByMissionId(missionId: number) {
    return prisma.missionLog.findMany({ where: { missionId }, orderBy: { timestamp: "desc" } });
  }
  async createMissionLog(log: Omit<MissionLog, "id">) {
    return prisma.missionLog.create({ data: log });
  }

  async getBatteryLogsByDroneId(droneId: number) {
    return prisma.batteryLog.findMany({ where: { droneId }, orderBy: { usageDate: "desc" } });
  }
  async createBatteryLog(log: Omit<BatteryLog, "id">) {
    return prisma.batteryLog.create({ data: log });
  }

  async seedData() {
    // Implement seeding logic using prisma.*.createMany()
  }
}

export const storage = new DatabaseStorage();