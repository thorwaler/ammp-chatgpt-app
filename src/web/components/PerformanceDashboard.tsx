/**
 * AMMP Performance Dashboard Component
 * Displays performance metrics with health indicators
 */

import React, { useState, useEffect } from 'react';

interface PerformanceMetrics {
  site_id: string;
  site_name?: string;
  period: {
    start: string;
    end: string;
  };
  availability_percent?: number;
  capacity_factor_percent?: number;
  performance_ratio_percent?: number;
  total_energy_kwh?: number;
  expected_energy_kwh?: number;
  downtime_hours?: number;
  specific_yield_kwh_kwp?: number;
}

interface PerformanceDashboardProps {
  siteId: string | null;
}

export function PerformanceDashboard({ siteId }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchPerformanceData();
  }, [siteId, dateRange]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const widgetData = (window as any).__WIDGET_DATA__;
      
      if (widgetData?.performanceData) {
        setMetrics(widgetData.performanceData);
      } else {
        // Generate sample data
        const sampleMetrics: PerformanceMetrics = {
          site_id: siteId || 'portfolio',
          site_name: siteId ? 'Sample Site' : 'Portfolio',
          period: dateRange,
          availability_percent: 95 + Math.random() * 4,
          capacity_factor_percent: 20 + Math.random() * 10,
          performance_ratio_percent: 75 + Math.random() * 10,
          total_energy_kwh: 10000 + Math.random() * 5000,
          expected_energy_kwh: 12000,
          downtime_hours: Math.random() * 24,
          specific_yield_kwh_kwp: 3.5 + Math.random() * 1.5,
        };
        setMetrics([sampleMetrics]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return '✅';
    if (value >= thresholds.warning) return '⚠️';
    return '🔴';
  };

  const getHealthClass = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'health-good';
    if (value >= thresholds.warning) return 'health-warning';
    return 'health-critical';
  };

  if (loading) {
    return <div className="performance-loading">Loading performance data...</div>;
  }

  if (error) {
    return <div className="performance-error">Error: {error}</div>;
  }

  return (
    <div className="performance-dashboard">
      <div className="performance-header">
        <h2>Performance Metrics</h2>
        <div className="date-range-selector">
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
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="performance-empty">
          No performance data available for the selected period.
        </div>
      ) : (
        <div className="metrics-grid">
          {metrics.map((metric, idx) => (
            <div key={idx} className="site-metrics">
              {metric.site_name && (
                <h3 className="site-metrics-title">{metric.site_name}</h3>
              )}
              
              <div className="metrics-cards">
                {/* Availability */}
                {metric.availability_percent !== undefined && (
                  <div className={`metric-card ${getHealthClass(metric.availability_percent, { good: 95, warning: 90 })}`}>
                    <div className="metric-header">
                      <span className="metric-icon">
                        {getHealthIcon(metric.availability_percent, { good: 95, warning: 90 })}
                      </span>
                      <span className="metric-label">Availability</span>
                    </div>
                    <div className="metric-value">
                      {metric.availability_percent.toFixed(2)}%
                    </div>
                    <div className="metric-description">
                      {metric.availability_percent >= 95 && 'Excellent uptime'}
                      {metric.availability_percent >= 90 && metric.availability_percent < 95 && 'Good uptime'}
                      {metric.availability_percent < 90 && 'Needs attention'}
                    </div>
                  </div>
                )}

                {/* Performance Ratio */}
                {metric.performance_ratio_percent !== undefined && (
                  <div className={`metric-card ${getHealthClass(metric.performance_ratio_percent, { good: 80, warning: 70 })}`}>
                    <div className="metric-header">
                      <span className="metric-icon">
                        {getHealthIcon(metric.performance_ratio_percent, { good: 80, warning: 70 })}
                      </span>
                      <span className="metric-label">Performance Ratio</span>
                    </div>
                    <div className="metric-value">
                      {metric.performance_ratio_percent.toFixed(2)}%
                    </div>
                    <div className="metric-description">
                      {metric.performance_ratio_percent >= 80 && 'Excellent efficiency'}
                      {metric.performance_ratio_percent >= 70 && metric.performance_ratio_percent < 80 && 'Good efficiency'}
                      {metric.performance_ratio_percent < 70 && 'Below target'}
                    </div>
                  </div>
                )}

                {/* Capacity Factor */}
                {metric.capacity_factor_percent !== undefined && (
                  <div className="metric-card">
                    <div className="metric-header">
                      <span className="metric-icon">📊</span>
                      <span className="metric-label">Capacity Factor</span>
                    </div>
                    <div className="metric-value">
                      {metric.capacity_factor_percent.toFixed(2)}%
                    </div>
                    <div className="metric-description">
                      Actual vs. maximum output
                    </div>
                  </div>
                )}

                {/* Energy Production */}
                {metric.total_energy_kwh !== undefined && (
                  <div className="metric-card">
                    <div className="metric-header">
                      <span className="metric-icon">⚡</span>
                      <span className="metric-label">Energy Production</span>
                    </div>
                    <div className="metric-value">
                      {metric.total_energy_kwh.toFixed(0)} kWh
                    </div>
                    {metric.expected_energy_kwh && (
                      <div className="metric-description">
                        Expected: {metric.expected_energy_kwh.toFixed(0)} kWh
                        <br />
                        {((metric.total_energy_kwh / metric.expected_energy_kwh) * 100).toFixed(1)}% of target
                      </div>
                    )}
                  </div>
                )}

                {/* Downtime */}
                {metric.downtime_hours !== undefined && (
                  <div className={`metric-card ${
                    metric.downtime_hours === 0 ? 'health-good' :
                    metric.downtime_hours < 24 ? 'health-warning' : 'health-critical'
                  }`}>
                    <div className="metric-header">
                      <span className="metric-icon">
                        {metric.downtime_hours === 0 ? '✅' :
                         metric.downtime_hours < 24 ? '⚠️' : '🔴'}
                      </span>
                      <span className="metric-label">Downtime</span>
                    </div>
                    <div className="metric-value">
                      {metric.downtime_hours.toFixed(1)} hrs
                    </div>
                    <div className="metric-description">
                      {metric.downtime_hours === 0 && 'Zero downtime'}
                      {metric.downtime_hours > 0 && metric.downtime_hours < 24 && 'Minor downtime'}
                      {metric.downtime_hours >= 24 && 'Significant downtime'}
                    </div>
                  </div>
                )}

                {/* Specific Yield */}
                {metric.specific_yield_kwh_kwp !== undefined && (
                  <div className="metric-card">
                    <div className="metric-header">
                      <span className="metric-icon">📈</span>
                      <span className="metric-label">Specific Yield</span>
                    </div>
                    <div className="metric-value">
                      {metric.specific_yield_kwh_kwp.toFixed(2)} kWh/kWp
                    </div>
                    <div className="metric-description">
                      Energy per installed capacity
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
