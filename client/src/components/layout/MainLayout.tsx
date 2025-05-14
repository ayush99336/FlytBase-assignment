import React, { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, droneActions, missionActions } from '@/lib/store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest } from '@/lib/queryClient';
import Header from './Header';
import Footer from './Footer';
import TabNavigation from './TabNavigation';

interface MainLayoutProps {
  children: ReactNode;
  showTabs?: boolean;
  tabs?: Array<{ id: string, label: string }>;
  onTabChange?: (tabId: string) => void;
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
  onTabChange 
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
      
      {showTabs && (
        <TabNavigation tabs={tabs} onChange={onTabChange} />
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

export default MainLayout;
