import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, missionLogActions } from '@/lib/store';
import { apiRequest } from '@/lib/queryClient';
import { formatTime } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface MissionLogProps {
  missionId: number;
}

export function MissionLog({ missionId }: MissionLogProps) {
  const dispatch = useDispatch();
  const missionLogs = useSelector((state: RootState) => 
    state.missionLogs.logs[missionId] || []
  );
  const loading = useSelector((state: RootState) => state.missionLogs.loading);
  
  useEffect(() => {
    const fetchMissionLogs = async () => {
      try {
        dispatch(missionLogActions.setLoading(true));
        const response = await apiRequest('GET', `/api/missions/${missionId}/logs`);
        const logs = await response.json();
        dispatch(missionLogActions.setMissionLogs({ missionId, logs }));
      } catch (error) {
        console.error('Failed to fetch mission logs:', error);
        dispatch(missionLogActions.setError('Failed to fetch mission logs'));
      }
    };
    
    if (missionId) {
      fetchMissionLogs();
    }
  }, [missionId, dispatch]);
  
  const getLogTypeStyle = (logType: string) => {
    switch (logType.toUpperCase()) {
      case 'INFO':
        return 'bg-success/10 text-success';
      case 'WARN':
        return 'bg-warning/10 text-warning';
      case 'ERROR':
        return 'bg-danger/10 text-danger';
      case 'START':
        return 'bg-primary/10 text-primary';
      case 'END':
        return 'bg-neutral-500/10 text-neutral-700';
      default:
        return 'bg-neutral-500/10 text-neutral-700';
    }
  };
  
  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-300">
        <CardTitle className="font-medium">Mission Log</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : missionLogs.length === 0 ? (
          <div className="text-center py-4 text-neutral-500">
            No log entries available
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {missionLogs.map(log => (
              <div key={log.id} className="text-sm">
                <div className="flex items-start">
                  <div className="text-xs text-neutral-500 w-16 flex-shrink-0">
                    {formatTime(log.timestamp)}
                  </div>
                  <div className="flex-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getLogTypeStyle(log.logType)} mr-2`}>
                      {log.logType}
                    </span>
                    {log.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MissionLog;
