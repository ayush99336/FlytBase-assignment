import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { uiActions } from '@/lib/store';
import MainLayout from '@/components/layout/MainLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ActiveMissions from '@/components/dashboard/ActiveMissions';
import UpcomingMissions from '@/components/dashboard/UpcomingMissions';
import FleetStatus from '@/components/dashboard/FleetStatus';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const dispatch = useDispatch();
  
  // Set active tab on component mount
  useEffect(() => {
    dispatch(uiActions.setActiveTab('dashboard'));
  }, [dispatch]);
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-600">Last updated: 2 minutes ago</span>
            <Button variant="ghost" size="icon" className="rounded-full">
              <RefreshCw className="h-4 w-4 text-neutral-600" />
            </Button>
          </div>
        </div>
        
        {/* Status Cards */}
        <DashboardStats />
        
        {/* Active Missions */}
        <ActiveMissions />
        
        {/* Upcoming Missions and Fleet Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Upcoming Scheduled Missions</h2>
            <UpcomingMissions />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">Drone Fleet Status</h2>
            <FleetStatus />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
