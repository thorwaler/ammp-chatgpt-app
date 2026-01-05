/**
 * AMMP Widget Entry Point
 * Initializes the React app in the ChatGPT widget environment
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './App.css';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Listen for messages from the MCP server
window.addEventListener('message', (event) => {
  // Handle authentication results
  if (event.data?.type === 'mcp:result') {
    const { toolName, result } = event.data;
    
    // Store results in a global object for components to access
    if (!( window as any).__WIDGET_DATA__) {
      (window as any).__WIDGET_DATA__ = {};
    }
    
    const widgetData = (window as any).__WIDGET_DATA__;
    
    switch (toolName) {
      case 'authenticate_ammp':
        if (result.structuredContent?.success) {
          widgetData.authenticated = true;
          widgetData.sites = result.structuredContent.sites;
          
          // Dispatch custom event for React components
          window.dispatchEvent(new CustomEvent('ammp:authenticated', {
            detail: { sites: result.structuredContent.sites }
          }));
        }
        break;
        
      case 'get_ammp_alerts':
        if (result.structuredContent?.success) {
          widgetData.alerts = result.structuredContent.alerts;
          
          window.dispatchEvent(new CustomEvent('ammp:alerts-updated', {
            detail: { alerts: result.structuredContent.alerts }
          }));
        }
        break;
        
      case 'get_ammp_energy_data':
        if (result.structuredContent?.success) {
          widgetData.energyData = result.structuredContent.data;
          
          window.dispatchEvent(new CustomEvent('ammp:energy-updated', {
            detail: { data: result.structuredContent.data }
          }));
        }
        break;
        
      case 'get_ammp_performance':
        if (result.structuredContent?.success) {
          widgetData.performanceData = result.structuredContent.metrics;
          
          window.dispatchEvent(new CustomEvent('ammp:performance-updated', {
            detail: { metrics: result.structuredContent.metrics }
          }));
        }
        break;
        
      case 'get_ammp_devices':
        if (result.structuredContent?.success) {
          widgetData.devices = result.structuredContent.devices;
          
          window.dispatchEvent(new CustomEvent('ammp:devices-updated', {
            detail: { devices: result.structuredContent.devices }
          }));
        }
        break;
    }
  }
});
