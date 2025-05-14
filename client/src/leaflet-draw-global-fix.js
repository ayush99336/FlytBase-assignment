import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
if (typeof window !== 'undefined') {
  window.L = L;
  // Patch for leaflet-draw readableArea bug: ensure window.toLocaleString is defined
  if (!Number.prototype.toLocaleString) {
    Number.prototype.toLocaleString = function() { return String(this); };
  }
}
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
