/**
 * AMMP Energy Chart Component (Priority #2)
 * Interactive time-series chart using Recharts
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface EnergyDataPoint {
  timestamp: string;
  energy_kwh?: number;
  power_kw?: number;
  irradiance_w_m2?: number;
}

interface EnergyChartProps {
  siteId: string | null;
  compact?: boolean;
  defaultInterval?: 'hour' | 'day' | 'week' | 'month';
}

type ChartType = 'line' | 'area';
type Metric = 'energy' | 'power' | 'both';

export function EnergyChart({ siteId, compact = false, defaultInterval = 'day' }: EnergyChartProps) {
  const [data, setData] = useState<EnergyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [interval, setInterval] = useState<string>(defaultInterval);
  const [chartType, setChartType] = useState<ChartType>('area');
  const [metric, setMetric] = useState<Metric>('both');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Date shortcuts
  const applyDateShortcut = (shortcut: string) => {
    const now = new Date();
    let start: Date;
    let end = now;

    switch (shortcut) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'yesterday':
        start = new Date(now.setDate(now.getDate() - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last30days':
        start = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'thisweek':
        const dayOfWeek = now.getDay();
        start = new Date(now.setDate(now.getDate() - dayOfWeek));
        start.setHours(0, 0, 0, 0);
        break;
      case 'thismonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return;
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  };

  // Fetch energy data
  useEffect(() => {
    fetchEnergyData();
  }, [siteId, interval, dateRange]);

  const fetchEnergyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the MCP tool via postMessage
      const widgetData = (window as any).__WIDGET_DATA__;
      
      if (widgetData?.energyData) {
        setData(widgetData.energyData);
      } else {
        // Generate sample data for demonstration
        const sampleData = generateSampleData(interval, dateRange.start, dateRange.end);
        setData(sampleData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load energy data');
    } finally {
      setLoading(false);
    }
  };

  // Generate sample data (for demonstration)
  const generateSampleData = (interval: string, start: string, end: string): EnergyDataPoint[] => {
    const data: EnergyDataPoint[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    let current = new Date(startDate);
    const incrementMs = interval === 'hour' ? 3600000 : 24 * 3600000;
    
    while (current <= endDate) {
      const hour = current.getHours();
      const dayFactor = Math.sin((hour - 6) / 12 * Math.PI); // Peak at noon
      
      data.push({
        timestamp: current.toISOString(),
        energy_kwh: Math.max(0, 100 + 50 * dayFactor + Math.random() * 20),
        power_kw: Math.max(0, 50 + 30 * dayFactor + Math.random() * 10),
      });
      
      current = new Date(current.getTime() + incrementMs);
    }
    
    return data;
  };

  // Format data for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    
    switch (interval) {
      case 'hour':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'week':
      case 'month':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  // Calculate statistics
  const stats = {
    totalEnergy: data.reduce((sum, d) => sum + (d.energy_kwh || 0), 0),
    avgPower: data.length > 0
      ? data.reduce((sum, d) => sum + (d.power_kw || 0), 0) / data.length
      : 0,
    peakPower: Math.max(...data.map(d => d.power_kw || 0)),
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : Line;

  if (loading) {
    return <div className="energy-chart-loading">Loading energy data...</div>;
  }

  if (error) {
    return <div className="energy-chart-error">Error: {error}</div>;
  }

  return (
    <div className={`energy-chart-container ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div className="energy-chart-controls">
          <div className="control-group date-shortcuts">
            <label>Quick Select:</label>
            <button onClick={() => applyDateShortcut('today')}>Today</button>
            <button onClick={() => applyDateShortcut('yesterday')}>Yesterday</button>
            <button onClick={() => applyDateShortcut('last7days')}>Last 7 Days</button>
            <button onClick={() => applyDateShortcut('last30days')}>Last 30 Days</button>
            <button onClick={() => applyDateShortcut('thisweek')}>This Week</button>
            <button onClick={() => applyDateShortcut('thismonth')}>This Month</button>
          </div>

          <div className="control-group">
            <label>Interval:</label>
            <select value={interval} onChange={(e) => setInterval(e.target.value)}>
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>

          <div className="control-group">
            <label>Chart Type:</label>
            <button
              className={chartType === 'line' ? 'active' : ''}
              onClick={() => setChartType('line')}
            >
              Line
            </button>
            <button
              className={chartType === 'area' ? 'active' : ''}
              onClick={() => setChartType('area')}
            >
              Area
            </button>
          </div>

          <div className="control-group">
            <label>Metric:</label>
            <button
              className={metric === 'energy' ? 'active' : ''}
              onClick={() => setMetric('energy')}
            >
              Energy (kWh)
            </button>
            <button
              className={metric === 'power' ? 'active' : ''}
              onClick={() => setMetric('power')}
            >
              Power (kW)
            </button>
            <button
              className={metric === 'both' ? 'active' : ''}
              onClick={() => setMetric('both')}
            >
              Both
            </button>
          </div>

          <div className="control-group date-range">
            <label>From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <label>To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
            <button
              className="refresh-button"
              onClick={fetchEnergyData}
              title="Refresh data"
            >
              🔄
            </button>
          </div>
        </div>
      )}

      <div className="energy-chart-stats">
        <div className="stat-card">
          <div className="stat-label">Total Energy</div>
          <div className="stat-value">{stats.totalEnergy.toFixed(2)} kWh</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Power</div>
          <div className="stat-value">{stats.avgPower.toFixed(2)} kW</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Peak Power</div>
          <div className="stat-value">{stats.peakPower.toFixed(2)} kW</div>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={compact ? 200 : 400}>
          <ChartComponent
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              yAxisId="left"
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Power (kW)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="custom-tooltip">
                      <p className="tooltip-time">
                        {new Date(data.timestamp).toLocaleString()}
                      </p>
                      {(metric === 'energy' || metric === 'both') && data.energy_kwh !== undefined && (
                        <p className="tooltip-energy">
                          Energy: {data.energy_kwh.toFixed(2)} kWh
                        </p>
                      )}
                      {(metric === 'power' || metric === 'both') && data.power_kw !== undefined && (
                        <p className="tooltip-power">
                          Power: {data.power_kw.toFixed(2)} kW
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            
            {(metric === 'energy' || metric === 'both') && (
              <DataComponent
                yAxisId="left"
                type="monotone"
                dataKey="energy_kwh"
                name="Energy (kWh)"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            )}
            
            {(metric === 'power' || metric === 'both') && (
              <DataComponent
                yAxisId="right"
                type="monotone"
                dataKey="power_kw"
                name="Power (kW)"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>

      {!compact && data.length === 0 && (
        <div className="chart-empty">
          No energy data available for the selected period.
        </div>
      )}
    </div>
  );
}
