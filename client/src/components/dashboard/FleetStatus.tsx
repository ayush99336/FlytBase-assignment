import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { MoreVertical, AlertTriangle } from 'lucide-react';

export function FleetStatus() {
  const drones = useSelector((state: RootState) => state.drones.drones);
  
  // Count drones by status
  const readyCount = drones.filter(drone => drone.status === 'Available').length;
  const inMissionCount = drones.filter(drone => drone.status === 'In Mission').length;
  const chargingCount = drones.filter(drone => drone.status === 'Charging').length;
  const maintenanceCount = drones.filter(drone => drone.status === 'Maintenance').length;
  const totalCount = drones.length;
  
  // Calculate percentages
  const readyPercentage = totalCount ? (readyCount / totalCount) * 100 : 0;
  const inMissionPercentage = totalCount ? (inMissionCount / totalCount) * 100 : 0;
  const chargingPercentage = totalCount ? (chargingCount / totalCount) * 100 : 0;
  const maintenancePercentage = totalCount ? (maintenanceCount / totalCount) * 100 : 0;
  
  // Find drones with low battery (below 30%)
  const lowBatteryDrones = drones.filter(drone => drone.currentBatteryLevel < 30);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-sm font-medium text-neutral-700">Fleet Overview</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-neutral-600 hover:text-neutral-900">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View All Drones</DropdownMenuItem>
            <DropdownMenuItem>Export Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Ready for deployment</span>
            <span className="font-medium">{readyCount}</span>
          </div>
          <Progress value={readyPercentage} className="h-2 bg-neutral-300">
            <div className="bg-success h-2 rounded-full" style={{ width: `${readyPercentage}%` }}></div>
          </Progress>
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>In mission</span>
            <span className="font-medium">{inMissionCount}</span>
          </div>
          <Progress value={inMissionPercentage} className="h-2 bg-neutral-300">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${inMissionPercentage}%` }}></div>
          </Progress>
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Charging</span>
            <span className="font-medium">{chargingCount}</span>
          </div>
          <Progress value={chargingPercentage} className="h-2 bg-neutral-300">
            <div className="bg-warning h-2 rounded-full" style={{ width: `${chargingPercentage}%` }}></div>
          </Progress>
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Maintenance</span>
            <span className="font-medium">{maintenanceCount}</span>
          </div>
          <Progress value={maintenancePercentage} className="h-2 bg-neutral-300">
            <div className="bg-danger h-2 rounded-full" style={{ width: `${maintenancePercentage}%` }}></div>
          </Progress>
        </div>
        
        {lowBatteryDrones.length > 0 && (
          <div className="border-t border-neutral-300 pt-4 mt-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Low Battery Alerts</h4>
            <div className="space-y-2">
              {lowBatteryDrones.map(drone => (
                <div key={drone.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-warning mr-2" />
                    <span>{drone.model} ({drone.serialNumber})</span>
                  </div>
                  <span className="font-medium">{drone.currentBatteryLevel}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FleetStatus;
