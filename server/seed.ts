import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.missionLog.deleteMany();
  await prisma.telemetry.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.drone.deleteMany();

  // Create drones
  const drones = await prisma.drone.createMany({
    data: [
      {
        name: 'Falcon X1',
        model: 'DJI M300',
        status: 'Available',
        currentBatteryLevel: 100,
        flightHours: new Prisma.Decimal(120.5),
        lastMissionId: null,
      },
      {
        name: 'Eagle Eye',
        model: 'Parrot Anafi',
        status: 'Available',
        currentBatteryLevel: 85,
        flightHours: new Prisma.Decimal(75.2),
        lastMissionId: null,
      },
      {
        name: 'Sky Surveyor',
        model: 'DJI Phantom 4',
        status: 'Maintenance',
        currentBatteryLevel: 60,
        flightHours: new Prisma.Decimal(200.0),
        lastMissionId: null,
      },
      {
        name: 'Hawk Scout',
        model: 'Autel Evo II',
        status: 'Available',
        currentBatteryLevel: 95,
        flightHours: new Prisma.Decimal(50.7),
        lastMissionId: null,
      },
    ],
  });

  // Get drones for assignment
  const allDrones = await prisma.drone.findMany();

  // Advanced mission patterns
  const crosshatchPath = {
    type: 'LineString',
    coordinates: [
      [77.0, 28.0], [77.1, 28.0], [77.1, 28.1], [77.0, 28.1], [77.0, 28.0],
      [77.05, 28.0], [77.05, 28.1], [77.1, 28.05], [77.0, 28.05]
    ],
  };
  const perimeterPath = {
    type: 'LineString',
    coordinates: [
      [77.2, 28.2], [77.3, 28.2], [77.3, 28.3], [77.2, 28.3], [77.2, 28.2]
    ],
  };

  // Create missions
  const mission1 = await prisma.mission.create({
    data: {
      name: 'Warehouse Survey',
      status: 'Pending',
      droneId: allDrones[0].id,
      flightPath: crosshatchPath as any,
      patternType: 'Crosshatch',
      altitude: 120,
      speed: 10,
      imageOverlap: 70,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60),
      progress: 0,
      actualPath: null,
      duration: null,
      startedAt: null,
      completedAt: null,
    },
  });
  const mission2 = await prisma.mission.create({
    data: {
      name: 'Perimeter Patrol',
      status: 'In Progress',
      droneId: allDrones[1].id,
      flightPath: perimeterPath as any,
      patternType: 'Perimeter',
      altitude: 100,
      speed: 8,
      imageOverlap: 60,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      scheduledAt: new Date(Date.now() - 1000 * 60 * 60),
      startedAt: new Date(Date.now() - 1000 * 60 * 60),
      progress: 45,
      actualPath: {
        type: 'LineString',
        coordinates: perimeterPath.coordinates.slice(0, 3),
      } as any,
      duration: null,
      completedAt: null,
    },
  });
  const mission3 = await prisma.mission.create({
    data: {
      name: 'Solar Farm Inspection',
      status: 'Completed',
      droneId: allDrones[3].id,
      flightPath: crosshatchPath as any,
      patternType: 'Crosshatch',
      altitude: 110,
      speed: 9,
      imageOverlap: 65,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 47),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 47),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 46),
      progress: 100,
      actualPath: crosshatchPath as any,
      duration: 3600,
    },
  });

  // Telemetry for mission2 (simulate real-time)
  for (let i = 0; i < 5; i++) {
    await prisma.telemetry.create({
      data: {
        missionId: mission2.id,
        altitude: 100 + i,
        speed: 8 + Math.random(),
        batteryLevel: 85 - i * 5,
        latitude: 28.2 + i * 0.02,
        longitude: 77.2 + i * 0.02,
        distanceTraveled: i * 100,
        signalStrength: 90 - i * 2,
        timestamp: new Date(Date.now() - (5 - i) * 1000 * 60),
      },
    });
  }

  // Mission logs for all missions
  await prisma.missionLog.createMany({
    data: [
      {
        missionId: mission1.id,
        logType: 'INFO',
        message: 'Mission created and scheduled.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
      },
      {
        missionId: mission2.id,
        logType: 'INFO',
        message: 'Mission started.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        missionId: mission2.id,
        logType: 'INFO',
        message: 'Drone reached waypoint 1.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        missionId: mission3.id,
        logType: 'INFO',
        message: 'Mission completed successfully.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 46),
      },
    ],
  });

  // Update drones' lastMissionId
  await prisma.drone.update({ where: { id: allDrones[0].id }, data: { lastMissionId: mission1.id } });
  await prisma.drone.update({ where: { id: allDrones[1].id }, data: { lastMissionId: mission2.id } });
  await prisma.drone.update({ where: { id: allDrones[3].id }, data: { lastMissionId: mission3.id } });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
