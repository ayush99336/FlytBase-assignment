import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  Home,
  Square,
  PlaneTakeoff
} from 'lucide-react';

interface MissionControlsProps {
  missionId: number;
}

export function MissionControls({ missionId }: MissionControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  
  const mission = useSelector((state: RootState) => 
    state.missions.missions.find(m => m.id === missionId)
  );
  
  if (!mission) {
    return null;
  }
  
  const handleMissionControl = async (action: 'start' | 'pause' | 'resume' | 'abort' | 'rth') => {
    setIsUpdating(true);
    
    try {
      let newStatus;
      
      switch (action) {
        case 'start':
          newStatus = 'In Progress';
          break;
        case 'pause':
          newStatus = 'Paused';
          break;
        case 'resume':
          newStatus = 'In Progress';
          break;
        case 'abort':
          newStatus = 'Aborted';
          break;
        case 'rth':
          // Return to home doesn't change status, just logs an RTH command
          // Could create a mission log entry for RTH
          await apiRequest('POST', `/api/missions/${missionId}/logs`, {
            missionId,
            logType: 'INFO',
            message: 'Return to Home command issued'
          });
          toast({
            title: "Return to Home",
            description: "The drone has been instructed to return to its home position."
          });
          setIsUpdating(false);
          return;
      }
      
      const response = await apiRequest('PATCH', `/api/missions/${missionId}/status`, {
        status: newStatus
      });
      
      if (!response.ok) {
        throw new Error('Failed to update mission status');
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/missions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/missions/active'] });
      
      toast({
        title: `Mission ${action === 'start' ? 'Started' : action === 'pause' ? 'Paused' : action === 'resume' ? 'Resumed' : 'Aborted'}`,
        description: `The mission has been ${action === 'start' ? 'started' : action === 'pause' ? 'paused' : action === 'resume' ? 'resumed' : 'aborted'} successfully.`
      });
      
    } catch (error) {
      console.error(`Error ${action}ing mission:`, error);
      toast({
        title: "Operation Failed",
        description: `Failed to ${action} the mission. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Calculate estimated time remaining based on progress
  const getEstimatedTimeRemaining = () => {
    if (!mission.startedAt || mission.progress >= 100) return "0 minutes";
    
    const startTime = new Date(mission.startedAt).getTime();
    const now = new Date().getTime();
    const elapsed = (now - startTime) / 1000; // elapsed time in seconds
    
    // If progress is 0, we can't estimate
    if (mission.progress <= 0) return "calculating...";
    
    // Estimate total time based on progress so far
    const totalEstimated = (elapsed / mission.progress) * 100;
    const remaining = totalEstimated - elapsed;
    
    // Format remaining time
    if (remaining < 60) return "< 1 minute";
    return `${Math.round(remaining / 60)} minutes`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-neutral-300 p-4 w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <PlaneTakeoff className="text-primary mr-2" />
          <span className="font-medium">Mission Controls</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-sm">Status:</span>
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            mission.status === 'In Progress' ? 'bg-success/10 text-success' :
            mission.status === 'Paused' ? 'bg-warning/10 text-warning' :
            mission.status === 'Completed' ? 'bg-primary/10 text-primary' :
            mission.status === 'Aborted' ? 'bg-danger/10 text-danger' :
            'bg-neutral-500/10 text-neutral-700'
          }`}>
            {mission.status}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {mission.status === 'Planned' && (
          <Button
            variant="secondary"
            className="flex items-center justify-center"
            onClick={() => handleMissionControl('start')}
            disabled={isUpdating}
          >
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
        )}
        
        {mission.status === 'In Progress' && (
          <Button
            variant="secondary"
            className="flex items-center justify-center"
            onClick={() => handleMissionControl('pause')}
            disabled={isUpdating}
          >
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
        )}
        
        {mission.status === 'Paused' && (
          <Button
            variant="secondary"
            className="flex items-center justify-center"
            onClick={() => handleMissionControl('resume')}
            disabled={isUpdating}
          >
            <Play className="mr-2 h-4 w-4" /> Resume
          </Button>
        )}
        
        {(mission.status === 'In Progress' || mission.status === 'Paused') && (
          <>
            <Button
              variant="secondary"
              className="flex items-center justify-center"
              onClick={() => handleMissionControl('rth')}
              disabled={isUpdating}
            >
              <Home className="mr-2 h-4 w-4" /> RTH
            </Button>
            
            <Button
              variant="destructive"
              className="flex items-center justify-center"
              onClick={() => handleMissionControl('abort')}
              disabled={isUpdating}
            >
              <Square className="mr-2 h-4 w-4" /> Abort
            </Button>
          </>
        )}
      </div>
      <Progress value={mission.progress} className="w-full h-2 bg-neutral-300" />
      <div className="flex justify-between text-xs text-neutral-600 mt-1">
        <span>Progress: {mission.progress}%</span>
        <span>Est. time remaining: {getEstimatedTimeRemaining()}</span>
      </div>
    </div>
  );
}

export default MissionControls;
