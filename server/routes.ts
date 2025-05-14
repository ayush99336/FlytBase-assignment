import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertDroneSchema,
  insertMissionSchema, 
  updateMissionStatusSchema, 
  updateMissionProgressSchema,
  insertTelemetrySchema,
  insertMissionLogSchema
} from "@shared/schema";
import { log } from "./vite";

interface WsClient extends WebSocket {
  isAlive: boolean;
  clientId?: string;
  watchingMissions?: number[];
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });
  
  // Set up WebSocket server
  wss.on('connection', (ws: WsClient) => {
    ws.isAlive = true;
    ws.watchingMissions = [];
    
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe:mission':
            if (data.missionId) {
              ws.watchingMissions = ws.watchingMissions || [];
              if (!ws.watchingMissions.includes(data.missionId)) {
                ws.watchingMissions.push(data.missionId);
              }
              
              // Send initial mission data
              const mission = await storage.getMissionById(data.missionId);
              if (mission) {
                ws.send(JSON.stringify({
                  type: 'mission:update',
                  mission
                }));
              }
            }
            break;
            
          case 'unsubscribe:mission':
            if (data.missionId && ws.watchingMissions) {
              ws.watchingMissions = ws.watchingMissions.filter(id => id !== data.missionId);
            }
            break;
            
          case 'telemetry:update':
            if (data.telemetry) {
              try {
                const telemetryData = insertTelemetrySchema.parse(data.telemetry);
                const telemetry = await storage.createTelemetry(telemetryData);
                
                // Update mission progress based on telemetry
                if (telemetry.missionId) {
                  const mission = await storage.getMissionById(telemetry.missionId);
                  if (mission) {
                    // In a real system, calculate progress based on completed path vs planned path
                    // For simulation, we'll just advance the progress by a small increment
                    const newProgress = Math.min(100, mission.progress + 0.5);
                    
                    // Update mission progress
                    await storage.updateMissionProgress(mission.id, { 
                      progress: newProgress,
                      // Update actual path if coordinates provided
                      actualPath: data.actualPath || mission.actualPath
                    });
                    
                    // Broadcast mission update to subscribers
                    broadcastMissionUpdate(mission.id);
                  }
                }
                
                // Acknowledge receipt
                ws.send(JSON.stringify({
                  type: 'telemetry:ack',
                  id: telemetry.id
                }));
              } catch (error) {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Invalid telemetry data'
                }));
              }
            }
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });
    
    // Send initial active missions data
    storage.getActiveMissions().then(missions => {
      ws.send(JSON.stringify({
        type: 'missions:active',
        missions
      }));
    });
  });
  
  // Ping-pong to check connection status
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WsClient) => {
      if (!ws.isAlive) return ws.terminate();
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  wss.on('close', () => {
    clearInterval(interval);
  });

  // Function to broadcast mission updates
  const broadcastMissionUpdate = async (missionId: number) => {
    const mission = await storage.getMissionById(missionId);
    if (!mission) return;
    
    wss.clients.forEach((client: WsClient) => {
      if (client.readyState === WebSocket.OPEN && 
          client.watchingMissions && 
          client.watchingMissions.includes(missionId)) {
        client.send(JSON.stringify({
          type: 'mission:update',
          mission
        }));
      }
    });
  };

  // Helper function to simulate mission progress
  const simulateMissionProgress = async (missionId: number) => {
    const mission = await storage.getMissionById(missionId);
    if (!mission || mission.status !== "In Progress") return;
    
    // Simulate drone movement along the flight path
    if (mission.flightPath && typeof mission.flightPath === 'object') {
      const flightPath = mission.flightPath as { type: string, coordinates: number[][] };
      
      if (flightPath.type === 'LineString' && Array.isArray(flightPath.coordinates)) {
        // Calculate how far we've progressed through the path
        const totalPoints = flightPath.coordinates.length;
        const pointsToComplete = Math.floor(totalPoints * (mission.progress / 100));
        const nextPoint = Math.min(pointsToComplete + 1, totalPoints - 1);
        
        if (nextPoint < totalPoints) {
          // Get the next coordinate
          const [longitude, latitude] = flightPath.coordinates[nextPoint];
          
          // Create telemetry data
          const telemetry = {
            missionId: mission.id,
            altitude: mission.altitude || 80,
            speed: mission.speed || 5,
            batteryLevel: Math.max(25, 100 - mission.progress),
            latitude,
            longitude,
            distanceTraveled: 0, // Would calculate based on actual path length
            signalStrength: Math.floor(80 + Math.random() * 20)
          };
          
          await storage.createTelemetry(telemetry);
          
          // Create mission log periodically
          if (mission.progress % 25 === 0) {
            const sectionCompleted = Math.floor(mission.progress / 25);
            await storage.createMissionLog({
              missionId: mission.id,
              logType: "INFO",
              message: `Completed survey section ${sectionCompleted}/4`
            });
          }
          
          // Update actual path
          let actualPath = mission.actualPath;
          if (!actualPath) {
            actualPath = {
              type: "LineString",
              coordinates: flightPath.coordinates.slice(0, nextPoint + 1)
            };
          } else if (typeof actualPath === 'object' && actualPath.type === 'LineString') {
            actualPath.coordinates = flightPath.coordinates.slice(0, nextPoint + 1);
          }
          
          // Update mission progress
          await storage.updateMissionProgress(mission.id, {
            progress: mission.progress + 0.5,
            actualPath
          });
          
          // Broadcast update
          broadcastMissionUpdate(mission.id);
          
          // If mission is close to completion
          if (mission.progress >= 99.5) {
            await storage.updateMissionStatus(mission.id, { status: "Completed" });
            broadcastMissionUpdate(mission.id);
            
            // Update drone battery level
            if (mission.droneId) {
              const drone = await storage.getDroneById(mission.droneId);
              if (drone) {
                await storage.updateDrone(drone.id, { 
                  currentBatteryLevel: Math.max(10, drone.currentBatteryLevel - 20),
                  status: "Available" 
                });
              }
            }
          }
        }
      }
    }
  };
  
  // Set up interval to simulate mission progress for all active missions
  setInterval(async () => {
    const activeMissions = await storage.getActiveMissions();
    for (const mission of activeMissions) {
      simulateMissionProgress(mission.id);
    }
  }, 3000);
  
  // Simulate random battery drain for drones
  setInterval(async () => {
    const drones = await storage.getDrones();
    for (const drone of drones) {
      if (drone.status === "Available" && drone.currentBatteryLevel > 0) {
        // Small random battery drain for idle drones
        const batteryDrain = Math.random() * 0.5;
        if (batteryDrain > 0.3) {  // Only drain occasionally
          const newBatteryLevel = Math.max(10, drone.currentBatteryLevel - batteryDrain);
          await storage.updateDrone(drone.id, { 
            currentBatteryLevel: newBatteryLevel
          });
          
          // Broadcast drone update to all clients
          wss.clients.forEach((client: WsClient) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'drone:update',
                drone: {...drone, currentBatteryLevel: newBatteryLevel}
              }));
            }
          });
        }
      }
    }
  }, 15000);
  
  // Periodically start random missions if none are active
  setInterval(async () => {
    const activeMissions = await storage.getActiveMissions();
    const allMissions = await storage.getMissions();
    const pendingMissions = allMissions.filter(m => m.status === "Pending");
    
    // If no active missions but there are pending ones, start one
    if (activeMissions.length === 0 && pendingMissions.length > 0) {
      const missionToStart = pendingMissions[Math.floor(Math.random() * pendingMissions.length)];
      
      // Get an available drone
      const drones = await storage.getDrones();
      const availableDrones = drones.filter(d => d.status === "Available" && d.currentBatteryLevel > 50);
      
      if (availableDrones.length > 0) {
        const selectedDrone = availableDrones[Math.floor(Math.random() * availableDrones.length)];
        
        // Update mission status and assign drone
        await storage.updateMissionStatus(missionToStart.id, { status: "In Progress" });
        await storage.updateDrone(selectedDrone.id, { status: "On Mission" });
        
        // Create mission log
        await storage.createMissionLog({
          missionId: missionToStart.id,
          logType: "INFO",
          message: `Mission started with drone ${selectedDrone.name}`
        });
        
        // Broadcast updates
        broadcastMissionUpdate(missionToStart.id);
        
        // Broadcast to all clients
        wss.clients.forEach((client: WsClient) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'mission:started',
              missionId: missionToStart.id
            }));
          }
        });
      }
    }
  }, 20000);
  
  /*
   * API Routes
   */
  
  // Drones API
  app.get('/api/drones', async (req, res) => {
    const drones = await storage.getDrones();
    res.json(drones);
  });
  
  app.get('/api/drones/:id', async (req, res) => {
    const drone = await storage.getDroneById(parseInt(req.params.id));
    if (!drone) {
      return res.status(404).json({ message: 'Drone not found' });
    }
    res.json(drone);
  });
  
  app.post('/api/drones', async (req, res) => {
    try {
      const droneData = insertDroneSchema.parse(req.body);
      const drone = await storage.createDrone(droneData);
      res.status(201).json(drone);
    } catch (error) {
      res.status(400).json({ message: 'Invalid drone data' });
    }
  });
  
  // Missions API
  app.get('/api/missions', async (req, res) => {
    const missions = await storage.getMissions();
    res.json(missions);
  });
  
  app.get('/api/missions/active', async (req, res) => {
    const missions = await storage.getActiveMissions();
    res.json(missions);
  });
  
  app.get('/api/missions/:id', async (req, res) => {
    const mission = await storage.getMissionById(parseInt(req.params.id));
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    res.json(mission);
  });
  
  app.post('/api/missions', async (req, res) => {
    try {
      const missionData = insertMissionSchema.parse(req.body);
      const mission = await storage.createMission(missionData);
      res.status(201).json(mission);
    } catch (error) {
      res.status(400).json({ message: 'Invalid mission data' });
    }
  });
  
  app.patch('/api/missions/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateMissionStatusSchema.parse(req.body);
      
      const mission = await storage.updateMissionStatus(id, updateData);
      if (!mission) {
        return res.status(404).json({ message: 'Mission not found' });
      }
      
      // Broadcast mission update
      broadcastMissionUpdate(id);
      
      res.json(mission);
    } catch (error) {
      res.status(400).json({ message: 'Invalid status update' });
    }
  });
  
  app.patch('/api/missions/:id/progress', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateMissionProgressSchema.parse(req.body);
      
      const mission = await storage.updateMissionProgress(id, updateData);
      if (!mission) {
        return res.status(404).json({ message: 'Mission not found' });
      }
      
      // Broadcast mission update
      broadcastMissionUpdate(id);
      
      res.json(mission);
    } catch (error) {
      res.status(400).json({ message: 'Invalid progress update' });
    }
  });
  
  // Mission logs API
  app.get('/api/missions/:id/logs', async (req, res) => {
    const missionId = parseInt(req.params.id);
    const logs = await storage.getMissionLogsByMissionId(missionId);
    res.json(logs);
  });
  
  app.post('/api/missions/:id/logs', async (req, res) => {
    try {
      const missionId = parseInt(req.params.id);
      const logData = { ...req.body, missionId };
      const log = await storage.createMissionLog(logData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ message: 'Invalid log data' });
    }
  });
  
  // Telemetry API
  app.get('/api/missions/:id/telemetry', async (req, res) => {
    const missionId = parseInt(req.params.id);
    const telemetry = await storage.getTelemetryByMissionId(missionId);
    res.json(telemetry);
  });

  return httpServer;
}
