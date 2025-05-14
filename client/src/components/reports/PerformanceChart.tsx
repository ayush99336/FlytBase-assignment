import React, { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

export function PerformanceChart() {
  const missions = useSelector((state: RootState) => state.missions.missions);
  const [metric, setMetric] = useState('missions');
  
  // Process mission data for the chart
  const generateChartData = () => {
    // Sort missions by date
    const sortedMissions = [...missions].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
    
    // Group missions by date
    const missionsByDate = sortedMissions.reduce((acc, mission) => {
      const date = new Date(mission.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          missions: 0,
          flightHours: 0,
          areaSurveyed: 0,
        };
      }
      
      acc[date].missions++;
      acc[date].flightHours += mission.duration ? mission.duration / 3600 : 0;
      acc[date].areaSurveyed += mission.area || 0;
      
      return acc;
    }, {} as Record<string, { missions: number, flightHours: number, areaSurveyed: number }>);
    
    // Convert to array for chart
    return Object.entries(missionsByDate).map(([date, stats]) => ({
      date,
      missions: stats.missions,
      flightHours: Number(stats.flightHours.toFixed(1)),
      areaSurveyed: Math.round(stats.areaSurveyed / 10000), // Convert to hectares
    }));
  };
  
  const chartData = generateChartData();
  
  // Get label and format value based on selected metric
  const getMetricConfig = () => {
    switch (metric) {
      case 'missions':
        return {
          label: 'Missions Completed',
          dataKey: 'missions',
          color: '#1976D2',
          formatter: (value: number) => `${value} missions`
        };
      case 'flightHours':
        return {
          label: 'Flight Hours',
          dataKey: 'flightHours',
          color: '#FF9800',
          formatter: (value: number) => `${value} hours`
        };
      case 'areaSurveyed':
        return {
          label: 'Area Surveyed (ha)',
          dataKey: 'areaSurveyed',
          color: '#4CAF50',
          formatter: (value: number) => `${value} hectares`
        };
      default:
        return {
          label: 'Missions Completed',
          dataKey: 'missions',
          color: '#1976D2',
          formatter: (value: number) => `${value} missions`
        };
    }
  };
  
  const metricConfig = getMetricConfig();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-neutral-300 flex justify-between items-center">
        <CardTitle className="font-medium">Mission Performance Trend</CardTitle>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="bg-neutral-200 border border-neutral-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-primary focus:border-primary w-[180px]">
            <SelectValue placeholder="Missions Completed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="missions">Missions Completed</SelectItem>
            <SelectItem value="flightHours">Flight Hours</SelectItem>
            <SelectItem value="areaSurveyed">Area Surveyed</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => formatDate(date)}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  label={{ 
                    value: metricConfig.label, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }} 
                />
                <Tooltip 
                  formatter={metricConfig.formatter}
                  labelFormatter={(date) => formatDate(date)}
                />
                <Area 
                  type="monotone" 
                  dataKey={metricConfig.dataKey} 
                  stroke={metricConfig.color} 
                  fillOpacity={1}
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">
              No data available for the selected metric
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PerformanceChart;
