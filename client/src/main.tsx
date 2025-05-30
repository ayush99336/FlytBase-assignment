import './leaflet-draw-global-fix.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Patch: assign Leaflet to window.L before importing leaflet-draw
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.L = L;
  // Patch for leaflet-draw readableArea bug: ensure window.toLocaleString is defined
  if (!Number.prototype.toLocaleString) {
    Number.prototype.toLocaleString = function() { return String(this); };
  }
}
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
