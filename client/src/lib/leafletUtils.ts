import L from 'leaflet';

// Mission area styles
export const areaStyle = {
  color: '#888',
  fillColor: '#888',
  fillOpacity: 0.2,
  weight: 2
};

// Planned path styles
export const plannedPathStyle = {
  color: '#1976D2',
  dashArray: '5, 5',
  weight: 2
};

// Actual path styles
export const actualPathStyle = {
  color: '#4CAF50',
  weight: 3
};

// Create drone icon
export const createDroneIcon = () => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976D2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2c1.1 0 2 .9 2 2"></path>
      <path d="M12 22c1.1 0 2-.9 2-2"></path>
      <path d="M19 12h3"></path>
      <path d="M2 12h3"></path>
      <path d="M12 2v4"></path>
      <path d="M12 22v-4"></path>
      <path d="m4.93 4.93 2.83 2.83"></path>
      <path d="m16.24 16.24 2.83 2.83"></path>
      <path d="M2 12a10 10 0 0 0 10 10"></path>
      <path d="M22 12a10 10 0 0 0-10-10"></path>
      <circle cx="12" cy="12" r="4"></circle>
    </svg>`,
    className: 'drone-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Convert GeoJSON coordinates to Leaflet latLngs
export const geoJsonToLatLngs = (geoJson: any): L.LatLngExpression[] => {
  if (!geoJson || !geoJson.coordinates || !Array.isArray(geoJson.coordinates)) {
    return [];
  }
  
  return geoJson.coordinates.map((coord: number[]) => {
    return [coord[1], coord[0]] as L.LatLngExpression;
  });
};

// Calculate the center of a set of coordinates
export const calculateCenter = (coordinates: number[][]): L.LatLngExpression => {
  if (!coordinates || coordinates.length === 0) {
    // Default to San Francisco if no coordinates
    return [37.7749, -122.4194];
  }
  
  const sum = coordinates.reduce(
    (acc, coord) => {
      return [acc[0] + coord[1], acc[1] + coord[0]];
    },
    [0, 0]
  );
  
  return [sum[0] / coordinates.length, sum[1] / coordinates.length];
};

// Calculate bounds for a set of coordinates
export const calculateBounds = (coordinates: number[][]): L.LatLngBoundsExpression => {
  if (!coordinates || coordinates.length === 0) {
    // Default to San Francisco area if no coordinates
    return [
      [37.7749 - 0.1, -122.4194 - 0.1],
      [37.7749 + 0.1, -122.4194 + 0.1]
    ];
  }
  
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  
  coordinates.forEach(coord => {
    minLat = Math.min(minLat, coord[1]);
    maxLat = Math.max(maxLat, coord[1]);
    minLng = Math.min(minLng, coord[0]);
    maxLng = Math.max(maxLng, coord[0]);
  });
  
  return [
    [minLat, minLng],
    [maxLat, maxLng]
  ];
};

// Calculate the area of a polygon in square meters
export const calculateArea = (latLngs: L.LatLng[]): number => {
  return L.GeometryUtil.geodesicArea(latLngs);
};

// Generate grid pattern coordinates for a rectangular area
export const generateGridPattern = (
  bounds: L.LatLngBounds,
  spacing: number = 0.0005 // Approximately 50m at equator
): number[][] => {
  const coordinates: number[][] = [];
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  
  let isEastward = true;
  
  for (let lat = sw.lat; lat <= ne.lat; lat += spacing) {
    if (isEastward) {
      coordinates.push([sw.lng, lat]);
      coordinates.push([ne.lng, lat]);
    } else {
      coordinates.push([ne.lng, lat]);
      coordinates.push([sw.lng, lat]);
    }
    isEastward = !isEastward;
  }
  
  return coordinates;
};

// Generate perimeter pattern coordinates for a rectangular area
export const generatePerimeterPattern = (bounds: L.LatLngBounds): number[][] => {
  const sw = bounds.getSouthWest();
  const se = L.latLng(sw.lat, bounds.getNorthEast().lng);
  const ne = bounds.getNorthEast();
  const nw = L.latLng(ne.lat, bounds.getSouthWest().lng);
  
  return [
    [sw.lng, sw.lat],
    [se.lng, se.lat],
    [ne.lng, ne.lat],
    [nw.lng, nw.lat],
    [sw.lng, sw.lat]
  ];
};

// Generate crosshatch pattern coordinates for a rectangular area
export const generateCrosshatchPattern = (
  bounds: L.LatLngBounds,
  spacing: number = 0.0005 // Approximately 50m at equator
): number[][] => {
  const coordinates: number[][] = [];
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  
  // Horizontal lines
  let isEastward = true;
  for (let lat = sw.lat; lat <= ne.lat; lat += spacing) {
    if (isEastward) {
      coordinates.push([sw.lng, lat]);
      coordinates.push([ne.lng, lat]);
    } else {
      coordinates.push([ne.lng, lat]);
      coordinates.push([sw.lng, lat]);
    }
    isEastward = !isEastward;
  }
  
  // Vertical lines
  let isNorthward = true;
  for (let lng = sw.lng; lng <= ne.lng; lng += spacing) {
    if (isNorthward) {
      coordinates.push([lng, sw.lat]);
      coordinates.push([lng, ne.lat]);
    } else {
      coordinates.push([lng, ne.lat]);
      coordinates.push([lng, sw.lat]);
    }
    isNorthward = !isNorthward;
  }
  
  return coordinates;
};

// Generate spiral pattern coordinates for a rectangular area
export const generateSpiralPattern = (bounds: L.LatLngBounds): number[][] => {
  const coordinates: number[][] = [];
  let sw = bounds.getSouthWest();
  let ne = bounds.getNorthEast();
  
  while (sw.lat < ne.lat && sw.lng < ne.lng) {
    // Top edge (left to right)
    coordinates.push([sw.lng, ne.lat]);
    coordinates.push([ne.lng, ne.lat]);
    
    // Right edge (top to bottom)
    coordinates.push([ne.lng, ne.lat]);
    coordinates.push([ne.lng, sw.lat]);
    
    // Bottom edge (right to left)
    coordinates.push([ne.lng, sw.lat]);
    coordinates.push([sw.lng, sw.lat]);
    
    // Left edge (bottom to top)
    coordinates.push([sw.lng, sw.lat]);
    coordinates.push([sw.lng, ne.lat]);
    
    // Shrink the bounds for the next loop
    sw = L.latLng(sw.lat + 0.0002, sw.lng + 0.0002);
    ne = L.latLng(ne.lat - 0.0002, ne.lng - 0.0002);
  }
  
  return coordinates;
};
