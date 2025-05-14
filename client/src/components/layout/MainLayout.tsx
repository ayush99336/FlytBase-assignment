import React, { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, droneActions, missionActions } from '@/lib/store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest } from '@/lib/queryClient';
import Header from './Header';
import Footer from './Footer';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface MainLayoutProps {
  children: ReactNode;
  showTabs?: boolean;
  tabs?: Array<{ id: string, label: string }>;
  onTabChange?: (tabId: string) => void;
  breadcrumbs?: Array<{ label: string, href?: string }>;
  title?: string;
}

export function MainLayout({ 
  children, 
  showTabs = true, 
  tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'plan', label: 'Mission Planning' },
    { id: 'monitor', label: 'Mission Monitoring' },
    { id: 'fleet', label: 'Fleet Management' },
    { id: 'reports', label: 'Reports & Analytics' }
  ],
  onTabChange,
  breadcrumbs = [],
  title
}: MainLayoutProps) {
  const { sendMessage } = useWebSocket();
  const dispatch = useDispatch();
  
  // Fetch initial data on component mount
  useEffect(() => {
    // Fetch drones
    const fetchDrones = async () => {
      try {
        dispatch(droneActions.setLoading(true));
        const response = await apiRequest('GET', '/api/drones');
        const drones = await response.json();
        dispatch(droneActions.setDrones(drones));
      } catch (error) {
        dispatch(droneActions.setError('Failed to fetch drones.'));
      }
    };

    // Fetch missions
    const fetchMissions = async () => {
      try {
        dispatch(missionActions.setLoading(true));
        const response = await apiRequest('GET', '/api/missions');
        const missions = await response.json();
        dispatch(missionActions.setMissions(missions));
      } catch (error) {
        dispatch(missionActions.setError('Failed to fetch missions.'));
      }
    };

    fetchDrones();
    fetchMissions();
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6">
          {breadcrumbs.length > 0 && (
            <Breadcrumb items={breadcrumbs} />
          )}
          
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">{title}</h1>
              {breadcrumbs.length === 0 && (
                <p className="text-neutral-600">DroneOps Mission Management System</p>
              )}
            </div>
          )}
        </div>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

export default MainLayout;
