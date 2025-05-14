import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { formatArea } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PlaneLanding, 
  Focus, 
  CheckCircle, 
  Map as MapIcon 
} from 'lucide-react';

export function DashboardStats() {
  const activeMissions = useSelector((state: RootState) => state.missions.activeMissions);
  const drones = useSelector((state: RootState) => state.drones.drones);
  const missions = useSelector((state: RootState) => state.missions.missions);
  
  const availableDrones = drones.filter(drone => drone.status === 'Available');
  const completedToday = missions.filter(mission => {
    if (mission.status !== 'Completed') return false;
    if (!mission.completedAt) return false;
    
    const today = new Date();
    const completedDate = new Date(mission.completedAt);
    return (
      completedDate.getDate() === today.getDate() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getFullYear() === today.getFullYear()
    );
  });
  
  // Calculate total area surveyed (in square meters)
  const totalArea = missions
    .filter(mission => mission.status === 'Completed')
    .reduce((sum, mission) => sum + (mission.area || 0), 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-neutral-600 text-sm font-medium">Active Missions</h3>
              <p className="text-2xl font-semibold mt-1">{activeMissions.length}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <PlaneLanding className="text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <span className="text-success flex items-center">
              <i className="fas fa-arrow-up mr-1"></i> 12%
            </span>
            <span className="text-neutral-600 ml-2">from last week</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-neutral-600 text-sm font-medium">Available Drones</h3>
              <p className="text-2xl font-semibold mt-1">{availableDrones.length}</p>
            </div>
            <div className="bg-success/10 p-3 rounded-full">
              <Focus className="text-success" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <span className="text-danger flex items-center">
              <i className="fas fa-arrow-down mr-1"></i> 3%
            </span>
            <span className="text-neutral-600 ml-2">from last week</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-neutral-600 text-sm font-medium">Completed Today</h3>
              <p className="text-2xl font-semibold mt-1">{completedToday.length}</p>
            </div>
            <div className="bg-secondary/10 p-3 rounded-full">
              <CheckCircle className="text-secondary" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <span className="text-success flex items-center">
              <i className="fas fa-arrow-up mr-1"></i> 24%
            </span>
            <span className="text-neutral-600 ml-2">from yesterday</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-neutral-600 text-sm font-medium">Total Area Surveyed</h3>
              <p className="text-2xl font-semibold mt-1">
                {formatArea(totalArea)}
              </p>
            </div>
            <div className="bg-warning/10 p-3 rounded-full">
              <MapIcon className="text-warning" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <span className="text-success flex items-center">
              <i className="fas fa-arrow-up mr-1"></i> 8%
            </span>
            <span className="text-neutral-600 ml-2">this month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardStats;
