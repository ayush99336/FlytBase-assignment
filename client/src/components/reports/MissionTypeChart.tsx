import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

export function MissionTypeChart() {
  const missions = useSelector((state: RootState) => state.missions.missions);
  
  // Count missions by type
  const missionCounts = missions.reduce((acc, mission) => {
    const type = mission.missionType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate percentages and create data for pie chart
  const totalMissions = missions.length;
  const chartData = Object.entries(missionCounts).map(([type, count]) => ({
    name: type,
    value: count,
    percentage: totalMissions > 0 ? Math.round((count / totalMissions) * 100) : 0
  }));
  
  // Sort by count (descending)
  chartData.sort((a, b) => b.value - a.value);
  
  // Colors for the pie chart
  const COLORS = ['#1976D2', '#FF9800', '#4CAF50', '#F44336', '#9C27B0', '#795548'];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-neutral-300 shadow-sm rounded-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{data.value} missions ({data.percentage}%)</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-neutral-300">
        <CardTitle className="font-medium">Mission Type Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64 flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${percentage}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-neutral-500">No mission data available</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center">
              <span 
                className="w-3 h-3 rounded-sm mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="text-sm">{item.name} ({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default MissionTypeChart;
