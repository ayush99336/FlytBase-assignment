import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, missionActions, uiActions } from '@/lib/store';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import MissionMap from '@/components/monitoring/MissionMap';
import MissionControls from '@/components/monitoring/MissionControls';
import DroneStatus from '@/components/monitoring/DroneStatus';
import TelemetryData from '@/components/monitoring/TelemetryData';
import MissionLog from '@/components/monitoring/MissionLog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MissionMonitoring() {
  const dispatch = useDispatch();
  const { subscribeMissionUpdates, unsubscribeMissionUpdates } = useWebSocket();
  const activeMissions = useSelector((state: RootState) => state.missions.activeMissions);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [location] = useLocation();

  // Parse query string for mission selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const missionParam = params.get('mission');
    const controlParam = params.get('control');
    if (missionParam) {
      const missionId = parseInt(missionParam);
      if (!isNaN(missionId)) setSelectedMissionId(missionId);
    }
    if (controlParam === '1') setShowControls(true);
  }, [location]);

  // Set active tab on component mount
  useEffect(() => {
    dispatch(uiActions.setActiveTab('monitor'));
    
    // Fetch active missions if not already loaded
    if (activeMissions.length === 0) {
      const fetchActiveMissions = async () => {
        try {
          const response = await apiRequest('GET', '/api/missions/active');
          const missions = await response.json();
          dispatch(missionActions.setActiveMissions(missions));
          
          // Select the first mission by default if available
          if (missions.length > 0 && !selectedMissionId) {
            setSelectedMissionId(missions[0].id);
          }
        } catch (error) {
          console.error('Failed to fetch active missions:', error);
        }
      };
      
      fetchActiveMissions();
    } else if (activeMissions.length > 0 && !selectedMissionId) {
      // Select first mission if we already have missions but none selected
      setSelectedMissionId(activeMissions[0].id);
    }
  }, [dispatch, activeMissions.length, selectedMissionId]);
  
  // Subscribe to WebSocket updates for the selected mission
  useEffect(() => {
    if (selectedMissionId) {
      subscribeMissionUpdates(selectedMissionId);
    }
    
    return () => {
      if (selectedMissionId) {
        unsubscribeMissionUpdates(selectedMissionId);
      }
    };
  }, [selectedMissionId, subscribeMissionUpdates, unsubscribeMissionUpdates]);
  
  const handleMissionChange = (missionId: string) => {
    // Unsubscribe from current mission
    if (selectedMissionId) {
      unsubscribeMissionUpdates(selectedMissionId);
    }
    
    // Set new mission ID
    const newMissionId = parseInt(missionId);
    setSelectedMissionId(newMissionId);
    
    // Subscribe to new mission
    subscribeMissionUpdates(newMissionId);
  };
  
  return (
    <MainLayout 
      title="Mission Monitoring"
      breadcrumbs={[
        { label: 'Missions', href: '/missions/plan' },
        { label: 'Monitoring' }
      ]}
    >
      <div className="container mx-auto px-4 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-neutral-600">Real-time tracking and control of drone operations</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select 
              value={selectedMissionId?.toString()} 
              onValueChange={handleMissionChange}
            >
              <SelectTrigger className="w-[300px] bg-white border border-neutral-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Select a mission" />
              </SelectTrigger>
              <SelectContent>
                {activeMissions.length === 0 ? (
                  <SelectItem value="none" disabled>No active missions</SelectItem>
                ) : (
                  activeMissions.map(mission => (
                    <SelectItem key={mission.id} value={mission.id.toString()}>
                      {mission.name} (MSN-{mission.id})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Mission Monitoring Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map View with Mission Control Panel */}
          <div className="lg:col-span-3 relative">
            <MissionMap missionId={selectedMissionId!} />
            
            {/* Floating Mission Control Panel */}
            {(showControls || selectedMissionId) && (
              <div className="absolute mission-control-panel bottom-6 left-1/2 transform -translate-x-1/2 w-full px-4">
                {selectedMissionId && <MissionControls missionId={selectedMissionId} />}
              </div>
            )}
          </div>
          
          {/* Status and Telemetry */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Drone Status */}
              {selectedMissionId && <DroneStatus missionId={selectedMissionId} />}
              
              {/* Telemetry Data */}
              {selectedMissionId && <TelemetryData missionId={selectedMissionId} />}
              
              {/* Mission Log */}
              {selectedMissionId && <MissionLog missionId={selectedMissionId} />}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default MissionMonitoring;
