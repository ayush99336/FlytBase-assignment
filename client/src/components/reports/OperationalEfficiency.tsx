import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lightbulb } from 'lucide-react';

export function OperationalEfficiency() {
  const missions = useSelector((state: RootState) => state.missions.missions);
  const drones = useSelector((state: RootState) => state.drones.drones);
  
  // Calculate planning efficiency metrics
  // For demo purposes, we'll use static values
  // In a real application, this would be calculated from actual data
  const planningEfficiency = 92;
  const avgPlanningToExecution = 2.4; // days
  
  // Flight execution efficiency (missions completed without intervention)
  const flightExecutionEfficiency = 88;
  
  // Battery utilization
  const batteryUtilization = 76;
  
  // Fleet availability
  const fleetAvailability = drones.length > 0
    ? (drones.filter(d => d.status === 'Available').length / drones.length) * 100
    : 0;
  
  // Recommendations for improvement
  const recommendations = [
    "Increase battery coverage by optimizing flight paths",
    "Schedule routine missions during lower wind conditions",
    "Standardize mission altitude for consistent data collection"
  ];
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-neutral-300">
        <CardTitle className="font-medium">Operational Efficiency</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Planning Efficiency</span>
            <span className="font-medium">{planningEfficiency}%</span>
          </div>
          <Progress 
            value={planningEfficiency} 
            className="w-full h-2 bg-neutral-300"
            indicatorClassName="bg-green-500" // green for planning
          />
          <p className="text-xs text-neutral-600 mt-1">
            Average time from planning to execution: {avgPlanningToExecution} days
          </p>
        </div>
        
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Flight Execution</span>
            <span className="font-medium">{flightExecutionEfficiency}%</span>
          </div>
          <Progress 
            value={flightExecutionEfficiency} 
            className="w-full h-2 bg-neutral-300"
            indicatorClassName="bg-primary" // blue for execution
          />
          <p className="text-xs text-neutral-600 mt-1">
            Missions completed as planned without intervention
          </p>
        </div>
        
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Battery Utilization</span>
            <span className="font-medium">{batteryUtilization}%</span>
          </div>
          <Progress 
            value={batteryUtilization} 
            className="w-full h-2 bg-neutral-300"
            indicatorClassName="bg-yellow-600" // yellow for battery
          />
          <p className="text-xs text-neutral-600 mt-1">
            Average battery consumption per mission area
          </p>
        </div>
        
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Fleet Availability</span>
            <span className="font-medium">{Math.round(fleetAvailability)}%</span>
          </div>
          <Progress 
            value={fleetAvailability} 
            className="w-full h-2 bg-neutral-300"
            indicatorClassName="bg-cyan-500" // fallback to Tailwind cyan if bg-info is not working
          />
          <p className="text-xs text-neutral-600 mt-1">
            Percentage of fleet ready for deployment
          </p>
        </div>
        
        <div className="border-t border-neutral-300 pt-4 mt-6">
          <h3 className="text-sm font-medium mb-2">Optimization Recommendations</h3>
          <ul className="space-y-2 text-sm">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <Lightbulb className="text-warning h-4 w-4 mt-1 mr-2" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default OperationalEfficiency;
