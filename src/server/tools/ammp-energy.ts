/**
 * AMMP Energy Data Tool (Priority #2)
 * Fetches time series energy production data
 * Priority: Daily data, supports hourly/weekly/monthly
 * Works for single site or portfolio
 */

import { z } from 'zod';
import { getAMPPClient } from '../ammp/client';

export const getEnergyDataTool = {
  name: 'get_ammp_energy_data',
  description: 'Get energy production time series data for AMMP sites. Can fetch data for a specific site or all sites combined (portfolio view). Supports multiple time intervals with daily being the default. Returns data formatted for interactive charts.',
  inputSchema: {
    site_id: z.string().optional().describe('Specific site ID, or omit for portfolio aggregation'),
    start_date: z.string().describe('Start date in ISO 8601 format (YYYY-MM-DD)'),
    end_date: z.string().describe('End date in ISO 8601 format (YYYY-MM-DD)'),
    interval: z.enum(['hour', 'day', 'week', 'month']).optional().describe('Time interval for aggregation. Default is "day" (24-hour periods)'),
    metrics: z.array(z.enum(['energy', 'power', 'irradiance'])).optional().describe('Metrics to include. Default includes energy and power'),
  },
};

export async function getEnergyDataHandler(args: {
  site_id?: string;
  start_date: string;
  end_date: string;
  interval?: 'hour' | 'day' | 'week' | 'month';
  metrics?: ('energy' | 'power' | 'irradiance')[];
}) {
  try {
    const client = getAMPPClient();
    
    if (!client.isAuthenticated()) {
      throw new Error('Not authenticated. Please authenticate with your AMMP API key first.');
    }

    // Default to daily interval and energy + power metrics
    const interval = args.interval || 'day';
    const metrics = args.metrics || ['energy', 'power'];

    const energyResponse = await client.getEnergyData({
      site_id: args.site_id,
      start_date: args.start_date,
      end_date: args.end_date,
      interval,
      metrics,
    });

    // Calculate statistics
    const dataPoints = energyResponse.data;
    const energyValues = dataPoints.map(d => d.energy_kwh || 0).filter(v => v > 0);
    const powerValues = dataPoints.map(d => d.power_kw || 0).filter(v => v > 0);

    const stats = {
      total_energy_kwh: energyValues.reduce((sum, v) => sum + v, 0),
      avg_power_kw: powerValues.length > 0 ? powerValues.reduce((sum, v) => sum + v, 0) / powerValues.length : 0,
      peak_power_kw: powerValues.length > 0 ? Math.max(...powerValues) : 0,
      data_points: dataPoints.length,
    };

    const structuredContent = {
      success: true,
      site_id: args.site_id || 'portfolio',
      site_name: energyResponse.site_name || 'Portfolio',
      period: {
        start: args.start_date,
        end: args.end_date,
      },
      interval,
      statistics: stats,
      units: energyResponse.units,
      data: dataPoints.map(point => ({
        timestamp: point.timestamp,
        energy_kwh: point.energy_kwh,
        power_kw: point.power_kw,
        irradiance_w_m2: point.irradiance_w_m2,
      })),
    };

    // Create formatted text summary
    const scope = args.site_id ? `site ${energyResponse.site_name || args.site_id}` : 'portfolio';
    const intervalLabel = {
      hour: 'hourly',
      day: 'daily',
      week: 'weekly',
      month: 'monthly',
    }[interval];

    let summary = `📊 Energy data for ${scope} (${intervalLabel} intervals)\n\n`;
    summary += `Period: ${args.start_date} to ${args.end_date}\n\n`;
    summary += `Statistics:\n`;
    summary += `• Total Energy: ${stats.total_energy_kwh.toFixed(2)} kWh\n`;
    summary += `• Average Power: ${stats.avg_power_kw.toFixed(2)} kW\n`;
    summary += `• Peak Power: ${stats.peak_power_kw.toFixed(2)} kW\n`;
    summary += `• Data Points: ${stats.data_points}\n\n`;

    // Show sample data points
    const samplePoints = dataPoints.slice(0, 5);
    if (samplePoints.length > 0) {
      summary += `Sample Data (first ${samplePoints.length} points):\n\n`;
      samplePoints.forEach(point => {
        const timestamp = new Date(point.timestamp).toLocaleString();
        const energy = point.energy_kwh?.toFixed(2) || 'N/A';
        const power = point.power_kw?.toFixed(2) || 'N/A';
        summary += `${timestamp}\n`;
        summary += `  Energy: ${energy} kWh | Power: ${power} kW\n`;
      });
      
      if (dataPoints.length > 5) {
        summary += `\n...and ${dataPoints.length - 5} more data points. View the interactive chart in the widget for full visualization.`;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
      structuredContent,
      _meta: {
        chart_data: dataPoints, // Full data for charting
        chart_type: 'timeseries',
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch energy data';
    
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching energy data: ${errorMessage}`,
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
