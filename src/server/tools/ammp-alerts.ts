/**
 * AMMP Alerts Tool (Priority #1)
 * Fetches and displays alerts with severity filtering
 * Focus on error and urgent alerts
 */

import { z } from 'zod';
import { getAMPPClient } from '../ammp/client';
import type { AlertSeverity, AlertStatus } from '../ammp/types';

export const getAlertsTool = {
  name: 'get_ammp_alerts',
  description: 'Get alerts for AMMP sites. Can fetch alerts for a specific site or all sites (portfolio view). Supports filtering by severity (error, warning, info) and status. Prioritizes error and urgent alerts.',
  inputSchema: {
    site_id: z.string().optional().describe('Specific site ID, or omit for all sites (portfolio)'),
    severity: z.array(z.enum(['error', 'warning', 'info'])).optional().describe('Filter by severity levels. Default shows all, but errors are prioritized'),
    status: z.array(z.enum(['active', 'resolved', 'acknowledged'])).optional().describe('Filter by alert status. Default shows active alerts'),
    start_date: z.string().optional().describe('Start date in ISO 8601 format (YYYY-MM-DD). Defaults to last 7 days'),
    end_date: z.string().optional().describe('End date in ISO 8601 format (YYYY-MM-DD). Defaults to now'),
    limit: z.number().optional().describe('Maximum number of alerts to return. Default 100'),
  },
};

export async function getAlertsHandler(args: {
  site_id?: string;
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  start_date?: string;
  end_date?: string;
  limit?: number;
}) {
  try {
    const client = getAMPPClient();
    
    if (!client.isAuthenticated()) {
      throw new Error('Not authenticated. Please authenticate with your AMMP API key first.');
    }

    // Default to last 7 days if no dates provided
    const endDate = args.end_date || new Date().toISOString().split('T')[0];
    const startDate = args.start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Default to active alerts if no status specified
    const status = args.status || ['active'];

    const alertsResponse = await client.getAlerts({
      site_id: args.site_id,
      severity: args.severity,
      status,
      start_date: startDate,
      end_date: endDate,
      limit: args.limit || 100,
    });

    // Count alerts by severity
    const severityCounts = {
      error: 0,
      warning: 0,
      info: 0,
    };

    alertsResponse.alerts.forEach(alert => {
      severityCounts[alert.severity]++;
    });

    // Sort alerts: errors first, then warnings, then info, then by timestamp (newest first)
    const sortedAlerts = [...alertsResponse.alerts].sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      
      if (severityDiff !== 0) return severityDiff;
      
      // Same severity, sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const structuredContent = {
      success: true,
      site_id: args.site_id || 'portfolio',
      period: {
        start: startDate,
        end: endDate,
      },
      total_alerts: alertsResponse.total,
      severity_counts: severityCounts,
      alerts: sortedAlerts.map(alert => ({
        id: alert.id,
        site_id: alert.site_id,
        site_name: alert.site_name,
        severity: alert.severity,
        status: alert.status,
        title: alert.title,
        message: alert.message,
        timestamp: alert.timestamp,
        resolved_at: alert.resolved_at,
        category: alert.category,
        device_id: alert.device_id,
      })),
      has_more: alertsResponse.has_more,
    };

    // Create formatted text summary
    const scope = args.site_id ? `site ${args.site_id}` : 'all sites';
    const errorEmoji = severityCounts.error > 0 ? '🔴' : '';
    const warningEmoji = severityCounts.warning > 0 ? '🟡' : '';
    
    let summary = `${errorEmoji}${warningEmoji} Found ${alertsResponse.total} alerts for ${scope}:\n\n`;
    summary += `Severity Breakdown:\n`;
    summary += `• Errors: ${severityCounts.error}\n`;
    summary += `• Warnings: ${severityCounts.warning}\n`;
    summary += `• Info: ${severityCounts.info}\n\n`;

    if (sortedAlerts.length > 0) {
      const topAlerts = sortedAlerts.slice(0, 10);
      summary += `Top ${topAlerts.length} Alerts (sorted by severity):\n\n`;
      
      topAlerts.forEach((alert, idx) => {
        const icon = alert.severity === 'error' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🔵';
        const timestamp = new Date(alert.timestamp).toLocaleString();
        const site = alert.site_name || alert.site_id;
        summary += `${idx + 1}. ${icon} ${alert.title}\n`;
        summary += `   Site: ${site} | ${timestamp}\n`;
        summary += `   ${alert.message}\n\n`;
      });

      if (alertsResponse.has_more) {
        summary += `\n...and ${alertsResponse.total - topAlerts.length} more alerts. Use the widget to view all.`;
      }
    } else {
      summary += `✅ No alerts found for the specified criteria.`;
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: summary,
        },
      ],
      structuredContent,
      _meta: {
        full_alerts_data: alertsResponse.alerts,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch alerts';
    
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error fetching alerts: ${errorMessage}`,
        },
      ],
      structuredContent: {
        success: false,
        error: errorMessage,
      },
      isError: true,
    };
  }
}
