import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uiActions } from '@/lib/store';
import MainLayout from '@/components/layout/MainLayout';
import DroneTable from '@/components/fleet/DroneTable';
import MaintenanceSchedule from '@/components/fleet/MaintenanceSchedule';
import BatteryHealth from '@/components/fleet/BatteryHealth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, Plus, CheckCircle, AlertCircle, Activity, BatteryCharging, List } from 'lucide-react';

export function FleetManagement() {
  const dispatch = useDispatch();
  const drones = useSelector((state: any) => state.drones.drones);
  const loading = useSelector((state: any) => state.drones.loading);
  const error = useSelector((state: any) => state.drones.error);

  // Real-time stats
  const totalDrones = drones.length;
  const availableDrones = drones.filter((d: any) => d.status === 'Available').length;
  const inMissionDrones = drones.filter((d: any) => d.status === 'On Mission').length;
  const chargingDrones = drones.filter((d: any) => d.status === 'Charging').length;
  const avgBattery = totalDrones > 0 ? Math.round(drones.reduce((sum: number, d: any) => sum + d.currentBatteryLevel, 0) / totalDrones) : 0;

  useEffect(() => {
    dispatch(uiActions.setActiveTab('fleet'));
  }, [dispatch]);

  return (
    <MainLayout
      title="Fleet Management"
      breadcrumbs={[
        { label: 'Fleet', href: '/fleet' }
      ]}
    >
      <div className="container mx-auto px-4 pb-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center"><List className="mr-2 h-5 w-5 text-primary" />Total Drones</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{totalDrones}</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-600" />Available</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-green-700">{availableDrones}</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center"><Activity className="mr-2 h-5 w-5 text-blue-600" />In Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-blue-700">{inMissionDrones}</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center"><BatteryCharging className="mr-2 h-5 w-5 text-yellow-600" />Avg Battery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{avgBattery}%</span>
                <Progress value={avgBattery} className="w-24 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error/Loading States */}
        {loading && <div className="mb-4 text-blue-600">Loading fleet data...</div>}
        {error && <div className="mb-4 text-red-600">{error}</div>}

        {/* Fleet Management Filter and List */}
        <div className="mb-6">
          <DroneTable />
        </div>

        {/* Maintenance Schedule and Battery Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MaintenanceSchedule />
          <BatteryHealth />
        </div>
      </div>
    </MainLayout>
  );
}

export default FleetManagement;
