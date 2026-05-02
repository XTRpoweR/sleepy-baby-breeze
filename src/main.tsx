
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/index.ts';
import { preloadCriticalResources } from './utils/performanceUtils';
import { captureFbclid } from './utils/fbTracking';

// Initialize performance optimizations
preloadCriticalResources();

// Capture Facebook click ID (?fbclid=...) → _fbc cookie + localStorage.
// First-party, non-PII; safe to run pre-consent. Highest-ROI Pixel improvement.
captureFbclid();

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(<App />);
