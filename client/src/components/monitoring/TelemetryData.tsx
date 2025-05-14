import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { formatDistance } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface TelemetryDataProps {
  missionId: number;
}

export function TelemetryData({ missionId }: TelemetryDataProps) {
  const telemetry = useSelector((state: RootState) => 
    state.telemetry.telemetry[missionId]?.[0] || null
  );
  
  const mission = useSelector((state: RootState) => 
    state.missions.missions.find(m => m.id === missionId)
  );
  
  // Calculate flight time
  const flightTime = React.useMemo(() => {
    if (!mission || !mission.startedAt) return "00:00";
    
    const startTime = new Date(mission.startedAt).getTime();
    const now = new Date().getTime();
    const diffInSeconds = Math.floor((now - startTime) / 1000);
    
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [mission]);
  
  if (!telemetry) {
    return (
      <Card>
        <CardHeader className="p-4 border-b border-neutral-300">
          <CardTitle className="font-medium">Live Telemetry</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-center h-40">
          <p className="text-neutral-500">No telemetry data available</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-300">
        <CardTitle className="font-medium">Live Telemetry</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-200 rounded-md p-3">
            <div className="text-xs text-neutral-600">Altitude</div>
            <div className="text-lg font-semibold">{telemetry.altitude} m</div>
          </div>
          <div className="bg-neutral-200 rounded-md p-3">
            <div className="text-xs text-neutral-600">Speed</div>
            <div className="text-lg font-semibold">{telemetry.speed} m/s</div>
          </div>
          <div className="bg-neutral-200 rounded-md p-3">
            <div className="text-xs text-neutral-600">Distance</div>
            <div className="text-lg font-semibold">{formatDistance(telemetry.distanceTraveled)}</div>
          </div>
          <div className="bg-neutral-200 rounded-md p-3">
            <div className="text-xs text-neutral-600">Flight Time</div>
            <div className="text-lg font-semibold">{flightTime}</div>
          </div>
        </div>
        <div className="bg-neutral-200 rounded-md p-3">
          <div className="text-xs text-neutral-600 mb-1">GPS Position</div>
          <div className="text-sm font-mono">
            {telemetry.latitude.toFixed(6)}° N, {telemetry.longitude.toFixed(6)}° W
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TelemetryData;
