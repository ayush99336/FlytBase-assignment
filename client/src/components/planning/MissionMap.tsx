import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatArea } from '@/lib/utils';
import { 
  Home, 
  ZoomIn, 
  ZoomOut, 
  Square, 
  Pencil, 
  Brush 
} from 'lucide-react';
import { useMap } from '@/hooks/useMap';

interface MissionMapProps {
  onAreaDraw?: (area: number, geoJson: any) => void;
}

export function MissionMap({ onAreaDraw }: MissionMapProps) {
  const { map, area, isMapReady, clearDrawnItems, resetMap } = useMap('planning-map', {
    drawControls: false,
    onAreaDraw
  });
  
  const handleMapReset = () => {
    resetMap();
  };
  
  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };
  
  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };
  
  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-300 flex justify-between items-center">
        <CardTitle className="font-medium">Define Survey Area</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            title="Reset View"
            onClick={handleMapReset}
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Zoom In"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Zoom Out"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Map container - Leaflet will initialize here */}
        <div id="planning-map" className="h-[calc(100vh-12rem)]"></div>
        
        <div className="p-4 border-t border-neutral-300 bg-neutral-200">
          <div className="flex flex-wrap items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Brush Tool</label>
              <div className="flex items-center bg-white rounded-md shadow-sm border border-neutral-300">
                <Button 
                  variant="ghost" 
                  className="px-3 py-2 border-r border-neutral-300 hover:bg-neutral-200 h-auto" 
                  title="Draw Rectangle"
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="px-3 py-2 border-r border-neutral-300 hover:bg-neutral-200 h-auto" 
                  title="Draw Polygon"
                >
                  <Brush className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="px-3 py-2 hover:bg-neutral-200 h-auto" 
                  title="Edit Shape"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Flight Pattern</label>
              <select className="bg-white border border-neutral-300 rounded-md px-3 py-2 pr-8 shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                <option>Grid Pattern</option>
                <option>Perimeter Scan</option>
                <option>Crosshatch Pattern</option>
                <option>Spiral Pattern</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Area Information</label>
              <div className="text-sm bg-white px-3 py-2 rounded-md border border-neutral-300">
                Area: <span id="area-size">{formatArea(area)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MissionMap;
