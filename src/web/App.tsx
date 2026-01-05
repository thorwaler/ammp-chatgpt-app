/**
 * Main AMMP Widget App
 * Interactive dashboard for AMMP solar energy monitoring
 */

import React, { useState, useEffect } from 'react';
import { AuthComponent } from './components/AuthComponent';
import { SiteSelector } from './components/SiteSelector';
import { EnergyChart } from './components/EnergyChart';
import { AlertsTable } from './components/AlertsTable';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { DevicesList } from './components/DevicesList';
import './App.css';

// Types for widget state
interface Site {
  id: string;
  name: string;
  capacity_kw?: number;
  status?: string;
}

interface WidgetState {
  isAuthenticated: boolean;
  sites: Site[];
  selectedSiteId: string | null; // null = portfolio view
  currentView: 'overview' | 'energy' | 'alerts' | 'performance' | 'devices';
}

export function App() {
  const [state, setState] = useState<WidgetState>({
    isAuthenticated: false,
    sites: [],
    selectedSiteId: null,
    currentView: 'overview',
  });

  // Listen for authentication events from MCP tools
  useEffect(() => {
    // Check if we're running in the ChatGPT widget environment
    if (typeof window !== 'undefined' && (window as any).__WIDGET_DATA__) {
      const widgetData = (window as any).__WIDGET_DATA__;
      
      // If authentication data is present, update state
      if (widgetData.authenticated && widgetData.sites) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          sites: widgetData.sites,
        }));
      }
    }

    // Listen for MCP tool results via postMessage
    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'ammp:authenticated':
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            sites: data.sites || [],
          }));
          break;
          
        case 'ammp:logout':
          setState({
            isAuthenticated: false,
            sites: [],
            selectedSiteId: null,
            currentView: 'overview',
          });
          break;
          
        case 'ammp:site_selected':
          setState(prev => ({
            ...prev,
            selectedSiteId: data.siteId,
          }));
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSiteChange = (siteId: string | null) => {
    setState(prev => ({ ...prev, selectedSiteId: siteId }));
  };

  const handleViewChange = (view: WidgetState['currentView']) => {
    setState(prev => ({ ...prev, currentView: view }));
  };

  // If not authenticated, show auth component
  if (!state.isAuthenticated) {
    return (
      <div className="ammp-widget">
        <div className="auth-container">
          <AuthComponent />
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="ammp-widget">
      <header className="widget-header">
        <h1>AMMP Energy Monitor</h1>
        <SiteSelector
          sites={state.sites}
          selectedSiteId={state.selectedSiteId}
          onSiteChange={handleSiteChange}
        />
      </header>

      <nav className="widget-nav">
        <button
          className={state.currentView === 'overview' ? 'active' : ''}
          onClick={() => handleViewChange('overview')}
        >
          📊 Overview
        </button>
        <button
          className={state.currentView === 'energy' ? 'active' : ''}
          onClick={() => handleViewChange('energy')}
        >
          ⚡ Energy
        </button>
        <button
          className={state.currentView === 'alerts' ? 'active' : ''}
          onClick={() => handleViewChange('alerts')}
        >
          🚨 Alerts
        </button>
        <button
          className={state.currentView === 'performance' ? 'active' : ''}
          onClick={() => handleViewChange('performance')}
        >
          📈 Performance
        </button>
        <button
          className={state.currentView === 'devices' ? 'active' : ''}
          onClick={() => handleViewChange('devices')}
        >
          🔧 Devices
        </button>
      </nav>

      <main className="widget-content">
        {state.currentView === 'overview' && (
          <div className="overview-view">
            <div className="overview-section">
              <h2>Quick Stats</h2>
              <AlertsTable
                siteId={state.selectedSiteId}
                compact={true}
                maxRows={5}
              />
            </div>
            <div className="overview-section">
              <h2>Today's Energy</h2>
              <EnergyChart
                siteId={state.selectedSiteId}
                compact={true}
                defaultInterval="day"
              />
            </div>
          </div>
        )}

        {state.currentView === 'energy' && (
          <EnergyChart siteId={state.selectedSiteId} />
        )}

        {state.currentView === 'alerts' && (
          <AlertsTable siteId={state.selectedSiteId} />
        )}

        {state.currentView === 'performance' && (
          <PerformanceDashboard siteId={state.selectedSiteId} />
        )}

        {state.currentView === 'devices' && (
          <DevicesList siteId={state.selectedSiteId} />
        )}
      </main>
    </div>
  );
}
