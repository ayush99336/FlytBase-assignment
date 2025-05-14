import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { formatArea } from '@/lib/utils';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  PlaneLanding,
  Clock,
  Map,
  Battery
} from 'lucide-react';

export function SummaryStats() {
  const missions = useSelector((state: RootState) => state.missions.missions);
  
  // Calculate statistics
  const totalMissions = missions.length;
  
  const completedMissions = missions.filter(m => m.status === 'Completed');
  const completionRate = totalMissions > 0 
    ? (completedMissions.length / totalMissions) * 100 
    : 0;
  
  // Calculate total flight hours
  const totalFlightHours = completedMissions.reduce((total, mission) => {
    return total + (mission.duration ? mission.duration / 3600 : 0);
  }, 0);
  
  // Calculate average flight hours per mission
  const avgFlightHours = completedMissions.length > 0 
    ? totalFlightHours / completedMissions.length 
    : 0;
  
  // Calculate total area surveyed
  const totalArea = completedMissions.reduce((total, mission) => {
    return total + (mission.area || 0);
  }, 0);
  
  // Coverage efficiency - for demo purposes, we'll use a fixed value
  const coverageEfficiency = 87;
  
  // Battery usage cycles - for demo purposes
  const batteryUsageCycles = totalMissions * 1.5; // A simple approximation
  const batteryEfficiency = 92; // A fixed value for demo
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-neutral-600 text-sm font-medium">Total Missions</h3>
              <p className="text-2xl font-semibold mt-1">{totalMissions}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <PlaneLanding className="text-primary" />
            </div>
          </div>
          <div className="mt-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Completion Rate</span>
              <span className="font-medium">{Math.round(completionRate)}%</span>
            </div>
            <Progress 
              value={completionRate} 
              className="w-full h-2 mt-1 bg-neutral-300"
              indicatorClassName="bg-success"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-neutral-600 text-sm font-medium">Flight Hours</h3>
              <p className="text-2xl font-semibold mt-1">{totalFlightHours.toFixed(1)}</p>
            </div>
            <div className="bg-secondary/10 p-3 rounded-full">
              <Clock className="text-secondary" />
            </div>
          </div>
          <div className="mt-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Avg. per Mission</span>
              <span className="font-medium">{avgFlightHours.toFixed(1)} hrs</span>
            </div>
            <Progress 
              value={Math.min(avgFlightHours * 10, 100)} 
              className="w-full h-2 mt-1 bg-neutral-300"
              indicatorClassName="bg-secondary"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-neutral-600 text-sm font-medium">Area Surveyed</h3>
              <p className="text-2xl font-semibold mt-1">{formatArea(totalArea)}</p>
            </div>
            <div className="bg-warning/10 p-3 rounded-full">
              <Map className="text-warning" />
            </div>
          </div>
          <div className="mt-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Coverage Efficiency</span>
              <span className="font-medium">{coverageEfficiency}%</span>
            </div>
            <Progress 
              value={coverageEfficiency} 
              className="w-full h-2 mt-1 bg-neutral-300"
              indicatorClassName="bg-warning"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-neutral-600 text-sm font-medium">Battery Usage</h3>
              <p className="text-2xl font-semibold mt-1">{Math.round(batteryUsageCycles)} cycles</p>
            </div>
            <div className="bg-success/10 p-3 rounded-full">
              <Battery className="text-success" />
            </div>
          </div>
          <div className="mt-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Avg. Efficiency</span>
              <span className="font-medium">{batteryEfficiency}%</span>
            </div>
            <Progress 
              value={batteryEfficiency} 
              className="w-full h-2 mt-1 bg-neutral-300"
              indicatorClassName="bg-success"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SummaryStats;
