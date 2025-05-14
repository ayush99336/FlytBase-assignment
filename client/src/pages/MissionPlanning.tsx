import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { uiActions } from '@/lib/store';
import MainLayout from '@/components/layout/MainLayout';
import MissionMap from '@/components/planning/MissionMap';
import MissionForm from '@/components/planning/MissionForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function MissionPlanning() {
  const dispatch = useDispatch();
  const [surveyArea, setSurveyArea] = useState<number>(0);
  const [surveyAreaGeoJson, setSurveyAreaGeoJson] = useState<any>(null);
  
  // Set active tab on component mount
  useEffect(() => {
    dispatch(uiActions.setActiveTab('plan'));
  }, [dispatch]);
  
  // Handle area draw from map component
  const handleAreaDraw = (area: number, geoJson: any) => {
    setSurveyArea(area);
    setSurveyAreaGeoJson(geoJson);
  };
  
  return (
    <MainLayout
      title="Mission Planning"
      breadcrumbs={[
        { label: 'Missions', href: '/missions/plan' },
        { label: 'Planning' }
      ]}
    >
      <div className="container mx-auto px-4 pb-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-600">Configure drone missions and survey parameters</p>
          <div>
            <Button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition flex items-center">
              <Plus className="mr-2 h-5 w-5" /> Create New Mission
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map and Drawing Tools */}
          <div className="lg:col-span-3">
            <MissionMap onAreaDraw={handleAreaDraw} />
          </div>
          
          {/* Mission Configuration */}
          <div className="lg:col-span-1">
            <MissionForm 
              surveyArea={surveyArea}
              surveyAreaGeoJson={surveyAreaGeoJson}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default MissionPlanning;
