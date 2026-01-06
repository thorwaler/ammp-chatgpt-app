/**
 * AMMP Alerts Table Component (Priority #1)
 * Interactive, sortable, filterable alerts table
 */

import React, { useState, useEffect } from 'react';

interface Alert {
  id: string;
  site_id: string;
  site_name?: string;
  severity: 'error' | 'warning' | 'info';
  status: 'active' | 'resolved' | 'acknowledged';
  title: string;
  message: string;
  timestamp: string;
  resolved_at?: string;
  category?: string;
  device_id?: string;
}

interface AlertsTableProps {
  siteId: string | null;
  compact?: boolean;
  maxRows?: number;
}

type SortField = 'timestamp' | 'severity' | 'site_name' | 'status';
type SortOrder = 'asc' | 'desc';

export function AlertsTable({ siteId, compact = false, maxRows }: AlertsTableProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>(['active']);
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('severity');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = maxRows || 20;
  
  // Expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Severity', 'Site', 'Title', 'Message', 'Timestamp', 'Status', 'Category', 'Device'];
    const rows = alerts.map(alert => [
      alert.severity,
      alert.site_name || alert.site_id,
      alert.title,
      alert.message,
      new Date(alert.timestamp).toISOString(),
      alert.status,
      alert.category || '',
      alert.device_id || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ammp-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Fetch alerts data
  useEffect(() => {
    fetchAlerts();
  }, [siteId, severityFilter, statusFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the MCP tool via postMessage
      // For now, we'll simulate with window data
      const widgetData = (window as any).__WIDGET_DATA__;
      
      if (widgetData?.alerts) {
        let filtered = widgetData.alerts;
        
        // Apply site filter
        if (siteId) {
          filtered = filtered.filter((a: Alert) => a.site_id === siteId);
        }
        
        // Apply severity filter
        if (severityFilter.length > 0) {
          filtered = filtered.filter((a: Alert) => 
            severityFilter.includes(a.severity)
          );
        }
        
        // Apply status filter
        if (statusFilter.length > 0) {
          filtered = filtered.filter((a: Alert) => 
            statusFilter.includes(a.status)
          );
        }
        
        setAlerts(filtered);
      } else {
        // No data yet, show empty state
        setAlerts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleRowExpanded = (alertId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedRows(newExpanded);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  const getSeverityClass = (severity: string) => {
    return `severity-${severity}`;
  };

  // Sort alerts
  const sortedAlerts = [...alerts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'severity':
        const severityOrder = { error: 0, warning: 1, info: 2 };
        comparison = severityOrder[a.severity] - severityOrder[b.severity];
        break;
      case 'timestamp':
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'site_name':
        comparison = (a.site_name || '').localeCompare(b.site_name || '');
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginate
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedAlerts = sortedAlerts.slice(startIdx, endIdx);
  const totalPages = Math.ceil(sortedAlerts.length / rowsPerPage);

  if (loading) {
    return <div className="alerts-loading">Loading alerts...</div>;
  }

  if (error) {
    return <div className="alerts-error">Error: {error}</div>;
  }

  const severityCounts = {
    error: alerts.filter(a => a.severity === 'error').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  };

  return (
    <div className={`alerts-table-container ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div className="alerts-header">
          <div className="alerts-summary">
            <span className="severity-badge error">
              🔴 {severityCounts.error} Errors
            </span>
            <span className="severity-badge warning">
              🟡 {severityCounts.warning} Warnings
            </span>
            <span className="severity-badge info">
              🔵 {severityCounts.info} Info
            </span>
          </div>
          
          <div className="alerts-actions">
            <button
              className="action-button refresh"
              onClick={fetchAlerts}
              title="Refresh alerts"
            >
              🔄 Refresh
            </button>
            <button
              className="action-button export"
              onClick={exportToCSV}
              disabled={alerts.length === 0}
              title="Export to CSV"
            >
              📥 Export CSV
            </button>
          </div>
          
          <div className="alerts-filters">
            <div className="filter-group">
              <label>Severity:</label>
              <button
                className={severityFilter.includes('error') ? 'active' : ''}
                onClick={() => {
                  setSeverityFilter(prev =>
                    prev.includes('error')
                      ? prev.filter(s => s !== 'error')
                      : [...prev, 'error']
                  );
                }}
              >
                🔴 Errors
              </button>
              <button
                className={severityFilter.includes('warning') ? 'active' : ''}
                onClick={() => {
                  setSeverityFilter(prev =>
                    prev.includes('warning')
                      ? prev.filter(s => s !== 'warning')
                      : [...prev, 'warning']
                  );
                }}
              >
                🟡 Warnings
              </button>
              <button
                className={severityFilter.includes('info') ? 'active' : ''}
                onClick={() => {
                  setSeverityFilter(prev =>
                    prev.includes('info')
                      ? prev.filter(s => s !== 'info')
                      : [...prev, 'info']
                  );
                }}
              >
                🔵 Info
              </button>
            </div>
            
            <div className="filter-group">
              <label>Status:</label>
              <button
                className={statusFilter.includes('active') ? 'active' : ''}
                onClick={() => {
                  setStatusFilter(prev =>
                    prev.includes('active')
                      ? prev.filter(s => s !== 'active')
                      : [...prev, 'active']
                  );
                }}
              >
                Active
              </button>
              <button
                className={statusFilter.includes('resolved') ? 'active' : ''}
                onClick={() => {
                  setStatusFilter(prev =>
                    prev.includes('resolved')
                      ? prev.filter(s => s !== 'resolved')
                      : [...prev, 'resolved']
                  );
                }}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="alerts-empty">
          ✅ No alerts found. All systems operating normally!
        </div>
      ) : (
        <>
          <table className="alerts-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('severity')} className="sortable">
                  Severity {sortField === 'severity' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('site_name')} className="sortable">
                  Site {sortField === 'site_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th>Title</th>
                <th onClick={() => handleSort('timestamp')} className="sortable">
                  Time {sortField === 'timestamp' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlerts.map(alert => (
                <React.Fragment key={alert.id}>
                  <tr className={getSeverityClass(alert.severity)}>
                    <td className="severity-cell">
                      {getSeverityIcon(alert.severity)}
                    </td>
                    <td>{alert.site_name || alert.site_id}</td>
                    <td className="title-cell">{alert.title}</td>
                    <td className="time-cell">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className={`status-badge ${alert.status}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="expand-button"
                        onClick={() => toggleRowExpanded(alert.id)}
                      >
                        {expandedRows.has(alert.id) ? '▼' : '▶'}
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(alert.id) && (
                    <tr className="expanded-row">
                      <td colSpan={6}>
                        <div className="alert-details">
                          <p><strong>Message:</strong> {alert.message}</p>
                          {alert.category && (
                            <p><strong>Category:</strong> {alert.category}</p>
                          )}
                          {alert.device_id && (
                            <p><strong>Device:</strong> {alert.device_id}</p>
                          )}
                          {alert.resolved_at && (
                            <p><strong>Resolved:</strong> {new Date(alert.resolved_at).toLocaleString()}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {!compact && totalPages > 1 && (
            <div className="alerts-pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
