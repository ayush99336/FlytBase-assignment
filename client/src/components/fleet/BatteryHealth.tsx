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

export function BatteryHealth() {
  const drones = useSelector((state: RootState) => state.drones.drones);
  
  // Calculate battery health statistics
  const batteryCounts = {
    excellent: 0, // 90-100%
    good: 0,      // 70-89%
    fair: 0,      // 50-69%
    poor: 0       // 0-49%
  };
  
  let totalBatteries = 0;
  let totalHealth = 0;
  
  drones.forEach(drone => {
    // In a real app, we would have a health metric separate from current charge level
    // For this example, we'll use a simple formula based on the current level
    const healthMetric = Math.min(100, drone.currentBatteryLevel + 20); // Just a sample formula
    
    if (healthMetric >= 90) {
      batteryCounts.excellent++;
    } else if (healthMetric >= 70) {
      batteryCounts.good++;
    } else if (healthMetric >= 50) {
      batteryCounts.fair++;
    } else {
      batteryCounts.poor++;
    }
    
    totalBatteries++;
    totalHealth += healthMetric;
  });
  
  const averageHealth = totalBatteries > 0 ? Math.round(totalHealth / totalBatteries) : 0;
  
  // Calculate percentages for the chart
  const excellentPercentage = totalBatteries > 0 ? (batteryCounts.excellent / totalBatteries) * 100 : 0;
  const goodPercentage = totalBatteries > 0 ? (batteryCounts.good / totalBatteries) * 100 : 0;
  const fairPercentage = totalBatteries > 0 ? (batteryCounts.fair / totalBatteries) * 100 : 0;
  const poorPercentage = totalBatteries > 0 ? (batteryCounts.poor / totalBatteries) * 100 : 0;
  
  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-300">
        <CardTitle className="font-medium">Battery Health Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="w-full max-w-md space-y-6">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Excellent (90-100%)</span>
                <span className="font-medium">{batteryCounts.excellent} batteries</span>
              </div>
              <Progress 
                value={excellentPercentage} 
                className="h-3 bg-neutral-300"
                indicatorClassName="bg-green-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Good (70-89%)</span>
                <span className="font-medium">{batteryCounts.good} batteries</span>
              </div>
              <Progress 
                value={goodPercentage} 
                className="h-3 bg-neutral-300"
                indicatorClassName="bg-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Fair (50-69%)</span>
                <span className="font-medium">{batteryCounts.fair} batteries</span>
              </div>
              <Progress 
                value={fairPercentage} 
                className="h-3 bg-neutral-300"
                indicatorClassName="bg-yellow-400"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Poor (0-49%)</span>
                <span className="font-medium">{batteryCounts.poor} batteries</span>
              </div>
              <Progress 
                value={poorPercentage} 
                className="h-3 bg-neutral-300"
                indicatorClassName="bg-red-500"
              />
            </div>
          </div>
        </div>
        <div className="text-center mt-2 text-sm text-neutral-600">
          <p>{totalBatteries} batteries monitored · Average health: {averageHealth}%</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default BatteryHealth;
