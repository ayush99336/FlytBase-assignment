import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function MaintenanceSchedule() {
  const drones = useSelector((state: RootState) => state.drones.drones);
  
  // This would typically come from an API, but we'll create some sample data
  const maintenanceSchedule = [
    {
      id: 1,
      droneId: 1,
      droneName: 'DJI Mavic 3 (DR-123)',
      type: 'Routine Check',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'Upcoming'
    },
    {
      id: 2,
      droneId: 2,
      droneName: 'Autel EVO II (DR-456)',
      type: 'Propeller Replacement',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      status: 'Upcoming'
    },
    {
      id: 3,
      droneId: 3,
      droneName: 'Skydio X2 (DR-789)',
      type: 'Camera Calibration',
      dueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000), // 13 days from now
      status: 'Upcoming'
    },
    {
      id: 4,
      droneId: 4,
      droneName: 'DJI Mavic 3 (DR-124)',
      type: 'Firmware Update',
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      status: 'Scheduled'
    }
  ];
  
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'upcoming':
      case 'scheduled':
        return 'bg-warning/10 text-warning';
      case 'overdue':
        return 'bg-danger/10 text-danger';
      default:
        return 'bg-neutral-500/10 text-neutral-700';
    }
  };
  
  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-300">
        <CardTitle className="font-medium">Upcoming Maintenance</CardTitle>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left pb-3 text-xs font-medium text-neutral-700 uppercase tracking-wider">Drone</TableHead>
              <TableHead className="text-left pb-3 text-xs font-medium text-neutral-700 uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-left pb-3 text-xs font-medium text-neutral-700 uppercase tracking-wider">Due Date</TableHead>
              <TableHead className="text-left pb-3 text-xs font-medium text-neutral-700 uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-neutral-300">
            {maintenanceSchedule.map(item => (
              <TableRow key={item.id}>
                <TableCell className="py-3 text-sm">
                  <div className="font-medium">{item.droneName}</div>
                </TableCell>
                <TableCell className="py-3 text-sm">{item.type}</TableCell>
                <TableCell className="py-3 text-sm">{formatDate(item.dueDate)}</TableCell>
                <TableCell className="py-3">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default MaintenanceSchedule;
