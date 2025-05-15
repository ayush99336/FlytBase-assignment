import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'wouter';
import { RootState } from '@/lib/store';
import { formatDateTime, formatDate, formatTime } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function UpcomingMissions() {
  const missions = useSelector((state: RootState) => state.missions.missions);
  
  // Get planned missions that are scheduled in the future
  const upcomingMissions = missions
    .filter(mission => 
      mission.status === 'Planned' && 
      mission.scheduledAt && 
      new Date(mission.scheduledAt) > new Date()
    )
    .sort((a, b) => {
      const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      return dateA - dateB;
    })
    .slice(0, 3); // Get only the next 3 upcoming missions
  
  // Function to calculate estimated duration based on mission parameters
  const getEstimatedDuration = (mission: any) => {
    // In a real app, this would be calculated based on area, speed, altitude, etc.
    // For now, just return a simple estimate
    const area = mission.area || 0;
    const speed = mission.speed || 5;
    
    const estimatedMinutes = Math.ceil(Math.sqrt(area) / speed * 2);
    return `~${estimatedMinutes} min`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Upcoming Scheduled Missions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-200">
              <TableRow>
                <TableHead className="text-neutral-700">Mission</TableHead>
                <TableHead className="text-neutral-700">Location</TableHead>
                <TableHead className="text-neutral-700">Schedule</TableHead>
                <TableHead className="text-right text-neutral-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingMissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No upcoming missions scheduled.
                  </TableCell>
                </TableRow>
              ) : (
                upcomingMissions.map(mission => (
                  <TableRow key={mission.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{mission.name}</div>
                      <div className="text-xs text-neutral-500">ID: MSN-{mission.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{mission.location.split(',')[0]}</div>
                      <div className="text-xs text-neutral-500">
                        {mission.location.split(',').slice(1).join(',').trim()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {mission.scheduledAt ? formatDateTime(mission.scheduledAt) : 'Not scheduled'}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Duration: {getEstimatedDuration(mission)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/missions/plan?edit=${mission.id}`}>
                        <Button variant="link" className="text-primary hover:text-primary-dark mr-3">Edit</Button>
                      </Link>
                      <Link href={`/monitor?mission=${mission.id}`}>
                        <Button variant="link" className="text-neutral-600 hover:text-neutral-900">Monitor</Button>
                      </Link>
                      <Button variant="link" className="text-neutral-600 hover:text-neutral-900">
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default UpcomingMissions;
