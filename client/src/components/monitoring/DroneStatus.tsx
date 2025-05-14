import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { getBatteryLevelColor } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Focus } from 'lucide-react';

interface DroneStatusProps {
  missionId: number;
}

export function DroneStatus({ missionId }: DroneStatusProps) {
  const mission = useSelector((state: RootState) => 
    state.missions.missions.find(m => m.id === missionId)
  );
  
  const drone = useSelector((state: RootState) => 
    mission && mission.droneId 
      ? state.drones.drones.find(d => d.id === mission.droneId)
      : null
  );
  
  const telemetry = useSelector((state: RootState) => 
    state.telemetry.telemetry[missionId]?.[0] || null
  );
  
  if (!drone) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-neutral-500">No drone assigned to this mission</p>
        </CardContent>
      </Card>
    );
  }
  
  // Use telemetry battery level if available, otherwise use drone's current level
  const batteryLevel = telemetry?.batteryLevel !== undefined
    ? telemetry.batteryLevel
    : drone.currentBatteryLevel;
  
  // Use telemetry signal strength if available, or default to 90%
  const signalStrength = telemetry?.signalStrength || 90;
  
  // For demonstration, we'll assume storage is at 42% used
  const storageUsed = 42;
  
  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-300">
        <CardTitle className="font-medium">Focus Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full mr-3">
            <Focus className="text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{drone.model}</h3>
            <p className="text-sm text-neutral-600">ID: {drone.serialNumber}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Battery</span>
              <span className="font-medium">{batteryLevel}%</span>
            </div>
            <Progress 
              value={batteryLevel} 
              className="w-full h-2 bg-neutral-300"
              indicatorClassName={getBatteryLevelColor(batteryLevel)}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Signal Strength</span>
              <span className="font-medium">{signalStrength}%</span>
            </div>
            <Progress 
              value={signalStrength} 
              className="w-full h-2 bg-neutral-300"
              indicatorClassName="bg-primary"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Storage</span>
              <span className="font-medium">{storageUsed}%</span>
            </div>
            <Progress 
              value={storageUsed} 
              className="w-full h-2 bg-neutral-300"
              indicatorClassName="bg-warning"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DroneStatus;
