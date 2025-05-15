import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'wouter';
import { RootState } from '@/lib/store';
import { getStatusColor } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export function ActiveMissions() {
  const activeMissions = useSelector((state: RootState) => state.missions.activeMissions);
  const drones = useSelector((state: RootState) => state.drones.drones);
  
  // Get drone information for each mission
  const missionsWithDroneInfo = activeMissions.map(mission => {
    const drone = drones.find(d => d.id === mission.droneId);
    return {
      ...mission,
      droneInfo: drone
    };
  });
  
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Active Missions</h2>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-200">
                <TableRow>
                  <TableHead className="text-neutral-700">Mission</TableHead>
                  <TableHead className="text-neutral-700">Location</TableHead>
                  <TableHead className="text-neutral-700">Drone</TableHead>
                  <TableHead className="text-neutral-700">Progress</TableHead>
                  <TableHead className="text-neutral-700">Status</TableHead>
                  <TableHead className="text-right text-neutral-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missionsWithDroneInfo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No active missions at the moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  missionsWithDroneInfo.map(mission => (
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
                        <div className="text-sm">{mission.droneInfo?.model}</div>
                        <div className="text-xs text-neutral-500">ID: {mission.droneInfo?.serialNumber}</div>
                      </TableCell>
                      <TableCell>
                        <Progress value={mission.progress} className="w-full h-2 bg-neutral-300" indicatorClassName="bg-primary" />
                        <div className="text-xs text-neutral-500 mt-1">{mission.progress}% Complete</div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(mission.status)}`}>
                          {mission.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/monitor?mission=${mission.id}`}>
                          <Button variant="link" className="text-primary hover:text-primary-dark mr-3">View</Button>
                        </Link>
                        <Link href={`/monitor?mission=${mission.id}&control=1`}>
                          <Button variant="link" className="text-neutral-600 hover:text-neutral-900">Control</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-3 border-t border-neutral-300 bg-neutral-200 flex justify-end">
          <Link href="/missions">
            <Button variant="link" className="text-primary hover:underline">View all missions</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ActiveMissions;
