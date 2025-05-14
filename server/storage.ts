import {
  Drone, InsertDrone, 
  Mission, InsertMission,
  Telemetry, InsertTelemetry,
  MissionLog, InsertMissionLog,
  BatteryLog, InsertBatteryLog,
  UpdateMissionStatus, UpdateMissionProgress
} from "@shared/schema";

export interface IStorage {
  // Drone operations
  getDrones(): Promise<Drone[]>;
  getDroneById(id: number): Promise<Drone | undefined>;
  createDrone(drone: InsertDrone): Promise<Drone>;
  updateDrone(id: number, drone: Partial<Drone>): Promise<Drone | undefined>;
  
  // Mission operations
  getMissions(): Promise<Mission[]>;
  getActiveMissions(): Promise<Mission[]>;
  getMissionById(id: number): Promise<Mission | undefined>;
  createMission(mission: InsertMission): Promise<Mission>;
  updateMissionStatus(id: number, update: UpdateMissionStatus): Promise<Mission | undefined>;
  updateMissionProgress(id: number, update: UpdateMissionProgress): Promise<Mission | undefined>;
  
  // Telemetry operations
  getTelemetryByMissionId(missionId: number): Promise<Telemetry[]>;
  createTelemetry(telemetry: InsertTelemetry): Promise<Telemetry>;
  
  // Mission logs operations
  getMissionLogsByMissionId(missionId: number): Promise<MissionLog[]>;
  createMissionLog(log: InsertMissionLog): Promise<MissionLog>;
  
  // Battery logs operations
  getBatteryLogsByDroneId(droneId: number): Promise<BatteryLog[]>;
  createBatteryLog(log: InsertBatteryLog): Promise<BatteryLog>;
}

export class MemStorage implements IStorage {
  private drones: Map<number, Drone>;
  private missions: Map<number, Mission>;
  private telemetry: Map<number, Telemetry>;
  private missionLogs: Map<number, MissionLog>;
  private batteryLogs: Map<number, BatteryLog>;
  
  private droneId: number;
  private missionId: number;
  private telemetryId: number;
  private missionLogId: number;
  private batteryLogId: number;
  
  constructor() {
    this.drones = new Map();
    this.missions = new Map();
    this.telemetry = new Map();
    this.missionLogs = new Map();
    this.batteryLogs = new Map();
    
    this.droneId = 1;
    this.missionId = 1;
    this.telemetryId = 1;
    this.missionLogId = 1;
    this.batteryLogId = 1;
    
    // Initialize with some sample data
    this.seedData();
  }
  
  // Drone operations
  async getDrones(): Promise<Drone[]> {
    return Array.from(this.drones.values());
  }
  
  async getDroneById(id: number): Promise<Drone | undefined> {
    return this.drones.get(id);
  }
  
  async createDrone(drone: InsertDrone): Promise<Drone> {
    const id = this.droneId++;
    const newDrone: Drone = { ...drone, id, lastMission: null };
    this.drones.set(id, newDrone);
    return newDrone;
  }
  
  async updateDrone(id: number, droneUpdate: Partial<Drone>): Promise<Drone | undefined> {
    const drone = this.drones.get(id);
    if (!drone) return undefined;
    
    const updatedDrone = { ...drone, ...droneUpdate };
    this.drones.set(id, updatedDrone);
    return updatedDrone;
  }
  
  // Mission operations
  async getMissions(): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }
  
  async getActiveMissions(): Promise<Mission[]> {
    return Array.from(this.missions.values()).filter(mission => 
      mission.status === "In Progress"
    );
  }
  
  async getMissionById(id: number): Promise<Mission | undefined> {
    return this.missions.get(id);
  }
  
  async createMission(mission: InsertMission): Promise<Mission> {
    const id = this.missionId++;
    const now = new Date();
    
    const newMission: Mission = {
      ...mission,
      id,
      createdAt: now,
      startedAt: null,
      completedAt: null,
      duration: null,
      actualPath: null,
      progress: 0,
    };
    
    this.missions.set(id, newMission);
    
    // Update drone status if assigned to a mission
    if (mission.droneId) {
      const drone = this.drones.get(mission.droneId);
      if (drone && mission.status === "In Progress") {
        this.drones.set(mission.droneId, {
          ...drone,
          status: "In Mission",
          lastMission: id
        });
      }
    }
    
    return newMission;
  }
  
  async updateMissionStatus(id: number, update: UpdateMissionStatus): Promise<Mission | undefined> {
    const mission = this.missions.get(id);
    if (!mission) return undefined;
    
    const now = new Date();
    let updatedMission: Mission = { ...mission, status: update.status };
    
    // Handle status-specific logic
    if (update.status === "In Progress" && mission.status !== "In Progress") {
      updatedMission.startedAt = now;
      
      // Update drone status if assigned
      if (mission.droneId) {
        const drone = this.drones.get(mission.droneId);
        if (drone) {
          this.drones.set(mission.droneId, {
            ...drone,
            status: "In Mission",
            lastMission: id
          });
        }
      }
      
      // Create a start mission log
      this.createMissionLog({
        missionId: id,
        logType: "START",
        message: "Mission initiated"
      });
    } 
    else if ((update.status === "Completed" || update.status === "Aborted") && mission.status === "In Progress") {
      updatedMission.completedAt = now;
      
      if (mission.startedAt) {
        const duration = Math.floor((now.getTime() - mission.startedAt.getTime()) / 1000);
        updatedMission.duration = duration;
      }
      
      // Update drone status if assigned
      if (mission.droneId) {
        const drone = this.drones.get(mission.droneId);
        if (drone) {
          // Calculate flight hours
          if (mission.startedAt && mission.droneId) {
            const flightHoursDelta = mission.duration 
              ? mission.duration / 3600 
              : (now.getTime() - mission.startedAt.getTime()) / 3600000;
            
            const newFlightHours = parseFloat(drone.flightHours) + flightHoursDelta;
            
            this.drones.set(mission.droneId, {
              ...drone,
              status: "Available",
              flightHours: newFlightHours.toString()
            });
          }
        }
      }
      
      // Create an end mission log
      this.createMissionLog({
        missionId: id,
        logType: update.status === "Completed" ? "INFO" : "WARN",
        message: `Mission ${update.status.toLowerCase()}`
      });
    }
    
    this.missions.set(id, updatedMission);
    return updatedMission;
  }
  
  async updateMissionProgress(id: number, update: UpdateMissionProgress): Promise<Mission | undefined> {
    const mission = this.missions.get(id);
    if (!mission) return undefined;
    
    const updatedMission: Mission = {
      ...mission,
      progress: update.progress,
      actualPath: update.actualPath || mission.actualPath
    };
    
    this.missions.set(id, updatedMission);
    return updatedMission;
  }
  
  // Telemetry operations
  async getTelemetryByMissionId(missionId: number): Promise<Telemetry[]> {
    return Array.from(this.telemetry.values()).filter(t => t.missionId === missionId);
  }
  
  async createTelemetry(telemetryData: InsertTelemetry): Promise<Telemetry> {
    const id = this.telemetryId++;
    const now = new Date();
    
    const newTelemetry: Telemetry = {
      ...telemetryData,
      id,
      timestamp: now
    };
    
    this.telemetry.set(id, newTelemetry);
    return newTelemetry;
  }
  
  // Mission logs operations
  async getMissionLogsByMissionId(missionId: number): Promise<MissionLog[]> {
    return Array.from(this.missionLogs.values())
      .filter(log => log.missionId === missionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async createMissionLog(log: InsertMissionLog): Promise<MissionLog> {
    const id = this.missionLogId++;
    const now = new Date();
    
    const newLog: MissionLog = {
      ...log,
      id,
      timestamp: now
    };
    
    this.missionLogs.set(id, newLog);
    return newLog;
  }
  
  // Battery logs operations
  async getBatteryLogsByDroneId(droneId: number): Promise<BatteryLog[]> {
    return Array.from(this.batteryLogs.values()).filter(log => log.droneId === droneId);
  }
  
  async createBatteryLog(log: InsertBatteryLog): Promise<BatteryLog> {
    const id = this.batteryLogId++;
    const now = new Date();
    
    const newLog: BatteryLog = {
      ...log,
      id,
      usageDate: now
    };
    
    this.batteryLogs.set(id, newLog);
    return newLog;
  }
  
  // Seed the database with initial data
  private seedData() {
    // Create drones
    const drone1 = this.createDrone({
      name: "Mavic-1",
      model: "DJI Mavic 3",
      serialNumber: "DR-123",
      batteryCapacity: 100,
      currentBatteryLevel: 67,
      status: "In Mission",
      location: "West Building Complex, San Francisco, CA",
      flightHours: "142.5",
      healthStatus: "good"
    });
    
    const drone2 = this.createDrone({
      name: "EVO-1",
      model: "Autel EVO II",
      serialNumber: "DR-456",
      batteryCapacity: 100,
      currentBatteryLevel: 35,
      status: "In Mission",
      location: "East Solar Farm, Phoenix, AZ",
      flightHours: "89.2",
      healthStatus: "good"
    });
    
    const drone3 = this.createDrone({
      name: "Skydio-1",
      model: "Skydio X2",
      serialNumber: "DR-789",
      batteryCapacity: 100,
      currentBatteryLevel: 28,
      status: "In Mission",
      location: "Main Warehouse, Seattle, WA",
      flightHours: "178.3",
      healthStatus: "good"
    });
    
    // Create several more drones with different statuses
    this.createDrone({
      name: "Mavic-2",
      model: "DJI Mavic 3",
      serialNumber: "DR-124",
      batteryCapacity: 100,
      currentBatteryLevel: 94,
      status: "Available",
      location: "Main Hangar, San Francisco, CA",
      flightHours: "156.7",
      healthStatus: "good"
    });
    
    this.createDrone({
      name: "Mavic-3",
      model: "DJI Mavic 3",
      serialNumber: "DR-125",
      batteryCapacity: 100,
      currentBatteryLevel: 25,
      status: "Charging",
      location: "Charging Station 2, San Francisco, CA",
      flightHours: "134.2",
      healthStatus: "fair"
    });
    
    this.createDrone({
      name: "Anafi-1",
      model: "Parrot Anafi",
      serialNumber: "DR-012",
      batteryCapacity: 100,
      currentBatteryLevel: 0,
      status: "Maintenance",
      location: "Maintenance Bay, San Francisco, CA",
      flightHours: "89.7",
      healthStatus: "poor"
    });
    
    // Create active missions
    const mission1 = this.createMission({
      name: "North Campus Survey",
      missionType: "Site Survey",
      status: "In Progress",
      location: "West Building Complex, San Francisco, CA",
      area: 12500,
      droneId: 1,
      scheduledAt: new Date(),
      altitude: 80,
      speed: 5,
      imageOverlap: 75,
      patternType: "Grid",
      flightPath: {
        type: "LineString",
        coordinates: [
          [-122.4190, 37.7780],
          [-122.4185, 37.7780],
          [-122.4185, 37.7775],
          [-122.4180, 37.7775],
          [-122.4180, 37.7770],
          [-122.4175, 37.7770],
          [-122.4175, 37.7765],
          [-122.4170, 37.7765],
          [-122.4170, 37.7760],
          [-122.4165, 37.7760],
          [-122.4165, 37.7755],
          [-122.4160, 37.7755],
          [-122.4160, 37.7750],
          [-122.4155, 37.7750],
          [-122.4150, 37.7750]
        ]
      }
    });
    
    const mission2 = this.createMission({
      name: "Solar Panel Inspection",
      missionType: "Inspection",
      status: "In Progress",
      location: "East Solar Farm, Phoenix, AZ",
      area: 8000,
      droneId: 2,
      scheduledAt: new Date(),
      altitude: 40,
      speed: 3,
      imageOverlap: 80,
      patternType: "Grid",
      flightPath: {
        type: "LineString",
        coordinates: [
          [-112.0740, 33.4484],
          [-112.0735, 33.4484],
          [-112.0735, 33.4480],
          [-112.0730, 33.4480],
          [-112.0730, 33.4476]
        ]
      }
    });
    
    const mission3 = this.createMission({
      name: "Perimeter Security Check",
      missionType: "Security",
      status: "In Progress",
      location: "Main Warehouse, Seattle, WA",
      area: 5000,
      droneId: 3,
      scheduledAt: new Date(),
      altitude: 30,
      speed: 4,
      imageOverlap: 70,
      patternType: "Perimeter",
      flightPath: {
        type: "LineString",
        coordinates: [
          [-122.3320, 47.6062],
          [-122.3315, 47.6062],
          [-122.3315, 47.6058],
          [-122.3320, 47.6058],
          [-122.3320, 47.6062]
        ]
      }
    });
    
    // Update mission progress for active missions
    this.updateMissionProgress(1, { progress: 75, actualPath: {
      type: "LineString",
      coordinates: [
        [-122.4190, 37.7780],
        [-122.4185, 37.7780],
        [-122.4185, 37.7775],
        [-122.4180, 37.7775],
        [-122.4180, 37.7770],
        [-122.4175, 37.7770],
        [-122.4175, 37.7765],
        [-122.4170, 37.7765],
        [-122.4168, 37.7762]
      ]
    }});
    
    this.updateMissionProgress(2, { progress: 35 });
    this.updateMissionProgress(3, { progress: 15 });
    
    // Create some scheduled missions
    this.createMission({
      name: "Roof Inspection",
      missionType: "Inspection",
      status: "Planned",
      location: "South Building, Chicago, IL",
      area: 2000,
      droneId: 4,
      scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
      altitude: 40,
      speed: 3,
      imageOverlap: 75,
      patternType: "Grid",
      flightPath: {
        type: "LineString",
        coordinates: [
          [-87.6298, 41.8781],
          [-87.6293, 41.8781],
          [-87.6293, 41.8778],
          [-87.6298, 41.8778],
          [-87.6298, 41.8781]
        ]
      }
    });
    
    this.createMission({
      name: "Construction Progress",
      missionType: "Site Survey",
      status: "Planned",
      location: "New Office Site, Denver, CO",
      area: 10000,
      droneId: 4,
      scheduledAt: new Date(Date.now() + 5 * 86400000), // 5 days from now
      altitude: 60,
      speed: 4,
      imageOverlap: 70,
      patternType: "Crosshatch",
      flightPath: {
        type: "LineString",
        coordinates: [
          [-104.9903, 39.7392],
          [-104.9898, 39.7392],
          [-104.9898, 39.7388],
          [-104.9903, 39.7388],
          [-104.9903, 39.7392]
        ]
      }
    });
    
    // Create mission logs for active missions
    this.createMissionLog({
      missionId: 1,
      logType: "START",
      message: "Mission initiated"
    });
    
    this.createMissionLog({
      missionId: 1,
      logType: "INFO",
      message: "Starting survey section 1"
    });
    
    this.createMissionLog({
      missionId: 1,
      logType: "INFO",
      message: "Completed survey section 1/4"
    });
    
    this.createMissionLog({
      missionId: 1,
      logType: "INFO",
      message: "Starting survey section 2"
    });
    
    this.createMissionLog({
      missionId: 1,
      logType: "INFO",
      message: "Completed survey section 2/4"
    });
    
    this.createMissionLog({
      missionId: 1,
      logType: "INFO",
      message: "Starting survey section 3"
    });
    
    this.createMissionLog({
      missionId: 1,
      logType: "WARN",
      message: "Wind speed increased to 6 m/s"
    });
    
    this.createMissionLog({
      missionId: 1,
      logType: "INFO",
      message: "Completed survey section 3/4"
    });
    
    // Create telemetry data for active mission
    this.createTelemetry({
      missionId: 1,
      altitude: 78,
      speed: 4.8,
      batteryLevel: 67,
      latitude: 37.7762,
      longitude: -122.4168,
      distanceTraveled: 483,
      signalStrength: 92
    });
  }
}

export const storage = new MemStorage();
