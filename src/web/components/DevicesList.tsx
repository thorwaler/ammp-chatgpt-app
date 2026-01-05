/**
 * AMMP Devices List Component
 * Displays device/inverter status and information
 */

import React, { useState, useEffect } from 'react';

interface Device {
  id: string;
  site_id: string;
  name: string;
  type: 'inverter' | 'meter' | 'sensor' | 'tracker' | 'other';
  manufacturer?: string;
  model?: string;
  capacity_kw?: number;
  status: 'online' | 'offline' | 'fault';
  last_communication?: string;
}

interface DevicesListProps {
  siteId: string | null;
}

export function DevicesList({ siteId }: DevicesListProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchDevices();
  }, [siteId]);

  const fetchDevices = async () => {
    if (!siteId) {
      setError('Please select a specific site to view devices');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const widgetData = (window as any).__WIDGET_DATA__;
      
      if (widgetData?.devices) {
        setDevices(widgetData.devices.filter((d: Device) => d.site_id === siteId));
      } else {
        // Generate sample data
        const sampleDevices: Device[] = [
          {
            id: 'inv-1',
            site_id: siteId,
            name: 'Inverter 1',
            type: 'inverter',
            manufacturer: 'SMA',
            model: 'Sunny Tripower',
            capacity_kw: 50,
            status: 'online',
            last_communication: new Date().toISOString(),
          },
          {
            id: 'inv-2',
            site_id: siteId,
            name: 'Inverter 2',
            type: 'inverter',
            manufacturer: 'SMA',
            model: 'Sunny Tripower',
            capacity_kw: 50,
            status: 'online',
            last_communication: new Date().toISOString(),
          },
          {
            id: 'meter-1',
            site_id: siteId,
            name: 'Main Meter',
            type: 'meter',
            status: 'online',
            last_communication: new Date().toISOString(),
          },
          {
            id: 'sensor-1',
            site_id: siteId,
            name: 'Weather Station',
            type: 'sensor',
            status: 'online',
            last_communication: new Date().toISOString(),
          },
        ];
        setDevices(sampleDevices);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '✅';
      case 'offline': return '🔴';
      case 'fault': return '⚠️';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inverter': return '🔌';
      case 'meter': return '⚡';
      case 'sensor': return '🌡️';
      case 'tracker': return '📡';
      default: return '🔧';
    }
  };

  const filteredDevices = devices.filter(device => {
    if (filterType !== 'all' && device.type !== filterType) return false;
    if (filterStatus !== 'all' && device.status !== filterStatus) return false;
    return true;
  });

  const typeCounts = devices.reduce((acc, device) => {
    acc[device.type] = (acc[device.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = {
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    fault: devices.filter(d => d.status === 'fault').length,
  };

  if (loading) {
    return <div className="devices-loading">Loading devices...</div>;
  }

  if (error) {
    return <div className="devices-error">{error}</div>;
  }

  return (
    <div className="devices-list-container">
      <div className="devices-header">
        <div className="devices-summary">
          <div className="summary-stat">
            <span className="stat-label">Total Devices</span>
            <span className="stat-value">{devices.length}</span>
          </div>
          <div className="summary-stat online">
            <span className="stat-label">✅ Online</span>
            <span className="stat-value">{statusCounts.online}</span>
          </div>
          <div className="summary-stat offline">
            <span className="stat-label">🔴 Offline</span>
            <span className="stat-value">{statusCounts.offline}</span>
          </div>
          <div className="summary-stat fault">
            <span className="stat-label">⚠️ Fault</span>
            <span className="stat-value">{statusCounts.fault}</span>
          </div>
        </div>

        <div className="devices-filters">
          <div className="filter-group">
            <label>Type:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {Object.keys(typeCounts).map(type => (
                <option key={type} value={type}>
                  {type} ({typeCounts[type]})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="online">Online ({statusCounts.online})</option>
              <option value="offline">Offline ({statusCounts.offline})</option>
              <option value="fault">Fault ({statusCounts.fault})</option>
            </select>
          </div>
        </div>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="devices-empty">
          No devices found matching the selected filters.
        </div>
      ) : (
        <div className="devices-grid">
          {filteredDevices.map(device => (
            <div key={device.id} className={`device-card status-${device.status}`}>
              <div className="device-card-header">
                <span className="device-type-icon">{getTypeIcon(device.type)}</span>
                <div className="device-title">
                  <h3>{device.name}</h3>
                  <span className="device-type">{device.type}</span>
                </div>
                <span className="device-status-icon">{getStatusIcon(device.status)}</span>
              </div>

              <div className="device-card-body">
                {(device.manufacturer || device.model) && (
                  <div className="device-info-row">
                    <span className="info-label">Model:</span>
                    <span className="info-value">
                      {device.manufacturer} {device.model}
                    </span>
                  </div>
                )}

                {device.capacity_kw && (
                  <div className="device-info-row">
                    <span className="info-label">Capacity:</span>
                    <span className="info-value">{device.capacity_kw} kW</span>
                  </div>
                )}

                <div className="device-info-row">
                  <span className="info-label">Status:</span>
                  <span className={`info-value status-badge status-${device.status}`}>
                    {device.status}
                  </span>
                </div>

                {device.last_communication && (
                  <div className="device-info-row">
                    <span className="info-label">Last Comm:</span>
                    <span className="info-value">
                      {new Date(device.last_communication).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {device.status === 'offline' && (
                <div className="device-alert">
                  ⚠️ Device is not communicating
                </div>
              )}

              {device.status === 'fault' && (
                <div className="device-alert fault">
                  🔴 Device has reported a fault
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
