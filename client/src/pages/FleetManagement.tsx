import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { uiActions } from '@/lib/store';
import MainLayout from '@/components/layout/MainLayout';
import DroneTable from '@/components/fleet/DroneTable';
import MaintenanceSchedule from '@/components/fleet/MaintenanceSchedule';
import BatteryHealth from '@/components/fleet/BatteryHealth';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';

export function FleetManagement() {
  const dispatch = useDispatch();
  
  // Set active tab on component mount
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-neutral-600">Monitor and manage your organization's drone fleet</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" className="flex items-center">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button className="bg-primary text-white flex items-center hover:bg-primary/90 transition">
              <Plus className="mr-2 h-4 w-4" /> Add New Drone
            </Button>
          </div>
        </div>
        
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
