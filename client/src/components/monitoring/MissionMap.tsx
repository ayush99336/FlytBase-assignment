import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMap } from '@/hooks/useMap';
import { formatDateTime } from '@/lib/utils';

interface MissionMapProps {
  missionId: number;
}

export function MissionMap({ missionId }: MissionMapProps) {
  const mission = useSelector((state: RootState) => 
    state.missions.missions.find(m => m.id === missionId)
  );
  
  const telemetry = useSelector((state: RootState) => 
    state.telemetry.telemetry[missionId] || []
  );
  
  const { map, isMapReady } = useMap('monitoring-map', {
    missionData: mission,
    interactive: false
  });
  
  // Update drone position when new telemetry comes in
  useEffect(() => {
    if (isMapReady && telemetry && telemetry.length > 0) {
      const latestTelemetry = telemetry[0];
      // Only update if we have valid coordinates
      if (latestTelemetry.latitude && latestTelemetry.longitude) {
        // Pass to map hook to update drone position
        // updateDronePosition(latestTelemetry.latitude, latestTelemetry.longitude);
      }
    }
  }, [isMapReady, telemetry]);
  
  if (!mission) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p>No mission selected</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-neutral-300 flex justify-between items-center">
        <div>
          <CardTitle className="font-medium">{mission.name}</CardTitle>
          <p className="text-sm text-neutral-600">{mission.location}</p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse mr-2"></span>
            <span className="text-sm text-success font-medium">Live</span>
          </div>
          <div className="text-sm text-neutral-600">
            Mission Time: <span className="font-medium">
              {mission.startedAt ? formatMissionTime(mission.startedAt) : '00:00:00'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div id="monitoring-map" className="h-[calc(100vh-12rem)]"></div>
      </CardContent>
    </Card>
  );
}

// Format mission time as HH:MM:SS
function formatMissionTime(startTime: string | Date): string {
  const start = new Date(startTime);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
  
  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default MissionMap;
