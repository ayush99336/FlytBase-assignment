import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  areaStyle, 
  plannedPathStyle, 
  actualPathStyle, 
  createDroneIcon, 
  geoJsonToLatLngs,
  calculateCenter,
  calculateBounds
} from '@/lib/leafletUtils';

interface UseMapOptions {
  missionData?: any;
  interactive?: boolean;
  drawControls?: boolean;
  onAreaDraw?: (area: number, geoJson: any) => void;
}

export function useMap(elementId: string, options: UseMapOptions = {}) {
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const surveyAreaRef = useRef<L.Polygon | null>(null);
  const plannedPathRef = useRef<L.Polyline | null>(null);
  const actualPathRef = useRef<L.Polyline | null>(null);
  const droneMarkerRef = useRef<L.Marker | null>(null);
  
  const [area, setArea] = useState<number>(0);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      // Default center if no mission data provided
      const defaultCenter: L.LatLngExpression = [37.7749, -122.4194];
      
      // Create the map
      const map = L.map(elementId).setView(defaultCenter, 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add drawing controls if requested
      if (options.drawControls) {
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        drawnItemsRef.current = drawnItems;
        
        const drawControl = new L.Control.Draw({
          draw: {
            polyline: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polygon: {
              allowIntersection: false,
              showArea: true
            }
          },
          edit: {
            featureGroup: drawnItems
          }
        });
        
        map.addControl(drawControl);
        
        map.on(L.Draw.Event.CREATED, function(event: any) {
          const layer = event.layer;
          drawnItems.addLayer(layer);
          
          // Calculate area if it's a polygon
          if (layer instanceof L.Polygon) {
            const areaInSqMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            setArea(areaInSqMeters);
            
            // Convert to GeoJSON and pass to callback
            if (options.onAreaDraw) {
              const geoJson = layer.toGeoJSON();
              options.onAreaDraw(areaInSqMeters, geoJson);
            }
          }
        });
        
        map.on(L.Draw.Event.EDITED, function() {
          // Recalculate area if polygon is edited
          let totalArea = 0;
          drawnItems.eachLayer(function(layer: any) {
            if (layer instanceof L.Polygon) {
              const areaInSqMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
              totalArea += areaInSqMeters;
              
              // Convert to GeoJSON and pass to callback
              if (options.onAreaDraw) {
                const geoJson = layer.toGeoJSON();
                options.onAreaDraw(areaInSqMeters, geoJson);
              }
            }
          });
          setArea(totalArea);
        });
        
        map.on(L.Draw.Event.DELETED, function() {
          // Reset area if polygon is deleted
          setArea(0);
          if (options.onAreaDraw) {
            options.onAreaDraw(0, null);
          }
        });
      }
      
      mapRef.current = map;
      setIsMapReady(true);
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [elementId, options.drawControls, options.onAreaDraw]);
  
  // Update map with mission data when available
  useEffect(() => {
    if (!mapRef.current || !isMapReady || !options.missionData) return;
    
    const map = mapRef.current;
    const { flightPath, actualPath } = options.missionData;
    
    // Clear existing layers
    if (surveyAreaRef.current) map.removeLayer(surveyAreaRef.current);
    if (plannedPathRef.current) map.removeLayer(plannedPathRef.current);
    if (actualPathRef.current) map.removeLayer(actualPathRef.current);
    if (droneMarkerRef.current) map.removeLayer(droneMarkerRef.current);
    
    // Add planned flight path if available
    if (flightPath && flightPath.coordinates && flightPath.coordinates.length > 0) {
      const coordinates = flightPath.coordinates;
      
      // Create polygon for survey area (using first and last points of path)
      const polygonCoords = [
        [coordinates[0][1], coordinates[0][0]],
        [coordinates[0][1], coordinates[coordinates.length-1][0]],
        [coordinates[coordinates.length-1][1], coordinates[coordinates.length-1][0]],
        [coordinates[coordinates.length-1][1], coordinates[0][0]]
      ];
      
      const polygon = L.polygon(polygonCoords as L.LatLngExpression[], areaStyle).addTo(map);
      surveyAreaRef.current = polygon;
      
      // Create polyline for planned path
      const pathCoords = geoJsonToLatLngs(flightPath);
      const polyline = L.polyline(pathCoords, plannedPathStyle).addTo(map);
      plannedPathRef.current = polyline;
      
      // Center map on path
      const center = calculateCenter(coordinates);
      const bounds = calculateBounds(coordinates);
      map.fitBounds(bounds);
    }
    
    // Add actual path if available
    if (actualPath && actualPath.coordinates && actualPath.coordinates.length > 0) {
      const pathCoords = geoJsonToLatLngs(actualPath);
      const polyline = L.polyline(pathCoords, actualPathStyle).addTo(map);
      actualPathRef.current = polyline;
      
      // Add drone marker at last position
      const lastCoord = actualPath.coordinates[actualPath.coordinates.length - 1];
      const droneIcon = createDroneIcon();
      const marker = L.marker([lastCoord[1], lastCoord[0]], { icon: droneIcon }).addTo(map);
      droneMarkerRef.current = marker;
    }
  }, [options.missionData, isMapReady]);
  
  const updateDronePosition = (lat: number, lng: number) => {
    if (!mapRef.current || !isMapReady) return;
    
    // Create or update drone marker
    if (!droneMarkerRef.current) {
      const droneIcon = createDroneIcon();
      droneMarkerRef.current = L.marker([lat, lng], { icon: droneIcon }).addTo(mapRef.current);
    } else {
      droneMarkerRef.current.setLatLng([lat, lng]);
    }
    
    // Update actual path if it exists
    if (actualPathRef.current) {
      const currentPath = actualPathRef.current.getLatLngs() as L.LatLng[];
      currentPath.push(L.latLng(lat, lng));
      actualPathRef.current.setLatLngs(currentPath);
    } else {
      // Create actual path if it doesn't exist
      actualPathRef.current = L.polyline([[lat, lng]], actualPathStyle).addTo(mapRef.current);
    }
  };
  
  const clearDrawnItems = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      setArea(0);
    }
  };
  
  const resetMap = () => {
    if (mapRef.current) {
      // Clear all layers
      if (surveyAreaRef.current) mapRef.current.removeLayer(surveyAreaRef.current);
      if (plannedPathRef.current) mapRef.current.removeLayer(plannedPathRef.current);
      if (actualPathRef.current) mapRef.current.removeLayer(actualPathRef.current);
      if (droneMarkerRef.current) mapRef.current.removeLayer(droneMarkerRef.current);
      
      // Reset references
      surveyAreaRef.current = null;
      plannedPathRef.current = null;
      actualPathRef.current = null;
      droneMarkerRef.current = null;
      
      // Clear drawn items
      clearDrawnItems();
      
      // Reset view
      mapRef.current.setView([37.7749, -122.4194], 13);
    }
  };
  
  return {
    map: mapRef.current,
    area,
    isMapReady,
    updateDronePosition,
    clearDrawnItems,
    resetMap
  };
}
