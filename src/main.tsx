
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/index.ts';
import { preloadCriticalResources } from './utils/performanceUtils';
import { captureFbclid } from './utils/fbTracking';
import { loadMetaPixel, loadConsent } from './utils/consentManager';

// Initialize performance optimizations
preloadCriticalResources();

// Load Meta Pixel immediately with the correct consent state.
// If the user hasn't decided yet (or declined), it loads in REVOKED mode so
// Meta still receives anonymous, non-PII signals for Modeled Conversions
// (GDPR-compliant). Once the user accepts, applyConsent() flips it to grant.
try {
  const stored = loadConsent();
  loadMetaPixel(Boolean(stored?.marketing));
} catch {
  /* ignore */
}

// Capture Facebook click ID (?fbclid=...) → _fbc cookie + localStorage.
// First-party, non-PII; safe to run pre-consent. Highest-ROI Pixel improvement.
captureFbclid();

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(<App />);
