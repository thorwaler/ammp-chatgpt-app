/**
 * AMMP Performance Metrics Tool (Priority #3)
 * Fetches performance metrics including efficiency, availability, and PR
 */

import { z } from 'zod';
import { getAMPPClient } from '../ammp/client';

export const getPerformanceTool = {
  name: 'get_ammp_performance',
  description: 'Get performance metrics for AMMP sites including availability, capacity factor, performance ratio (PR), and downtime. Can fetch for a specific site or portfolio aggregation.',
  inputSchema: {
    site_id: z.string().optional().describe('Specific site ID, or omit for portfolio summary'),
    start_date: z.string().describe('Start date in ISO 8601 format (YYYY-MM-DD)'),
    end_date: z.string().describe('End date in ISO 8601 format (YYYY-MM-DD)'),
    aggregation: z.enum(['daily', 'weekly', 'monthly']).optional().describe('Aggregation level. Default is daily'),
  },
};

export async function getPerformanceHandler(args: {
  site_id?: string;
  start_date: string;
  end_date: string;
  aggregation?: 'daily' | 'weekly' | 'monthly';
}) {
  try {
    const client = getAMPPClient();
    
    if (!client.isAuthenticated()) {
      throw new Error('Not authenticated. Please authenticate with your AMMP API key first.');
    }

    const aggregation = args.aggregation || 'daily';

    const performanceResponse = await client.getPerformance({
      site_id: args.site_id,
      start_date: args.start_date,
      end_date: args.end_date,
      aggregation,
    });

    // Prepare structured content
    const structuredContent = {
      success: true,
      site_id: args.site_id || 'portfolio',
      period: {
        start: args.start_date,
        end: args.end_date,
      },
      aggregation,
      metrics: performanceResponse.metrics,
      portfolio_summary: performanceResponse.portfolio_summary,
    };

    // Create formatted text summary
    const scope = args.site_id ? 'site' : 'portfolio';
    let summary = `📈 Performance metrics for ${scope}\n\n`;
    summary += `Period: ${args.start_date} to ${args.end_date}\n`;
    summary += `Aggregation: ${aggregation}\n\n`;

    if (performanceResponse.portfolio_summary) {
      const ps = performanceResponse.portfolio_summary;
      summary += `Portfolio Summary:\n`;
      summary += `• Total Energy: ${ps.total_energy_kwh?.toFixed(2) || 'N/A'} kWh\n`;
      summary += `• Average Availability: ${ps.average_availability_percent?.toFixed(2) || 'N/A'}%\n`;
      summary += `• Average Performance Ratio: ${ps.average_performance_ratio_percent?.toFixed(2) || 'N/A'}%\n`;
      summary += `• Total Capacity: ${ps.total_capacity_kw?.toFixed(2) || 'N/A'} kW\n\n`;
    }

    if (performanceResponse.metrics.length > 0) {
      summary += `Detailed Metrics:\n\n`;
      
      performanceResponse.metrics.forEach((metric, idx) => {
        const siteName = metric.site_name || metric.site_id;
        summary += `${idx + 1}. ${siteName}\n`;
        summary += `   Period: ${metric.period.start} to ${metric.period.end}\n`;
        
        if (metric.availability_percent !== undefined) {
          const availIcon = metric.availability_percent >= 95 ? '✅' : metric.availability_percent >= 90 ? '⚠️' : '🔴';
          summary += `   ${availIcon} Availability: ${metric.availability_percent.toFixed(2)}%\n`;
        }
        
        if (metric.capacity_factor_percent !== undefined) {
          summary += `   📊 Capacity Factor: ${metric.capacity_factor_percent.toFixed(2)}%\n`;
        }
        
        if (metric.performance_ratio_percent !== undefined) {
          const prIcon = metric.performance_ratio_percent >= 80 ? '✅' : metric.performance_ratio_percent >= 70 ? '⚠️' : '🔴';
          summary += `   ${prIcon} Performance Ratio: ${metric.performance_ratio_percent.toFixed(2)}%\n`;
        }
        
        if (metric.total_energy_kwh !== undefined) {
          summary += `   ⚡ Total Energy: ${metric.total_energy_kwh.toFixed(2)} kWh\n`;
        }
        
        if (metric.expected_energy_kwh !== undefined) {
          summary += `   🎯 Expected Energy: ${metric.expected_energy_kwh.toFixed(2)} kWh\n`;
        }
        
        if (metric.downtime_hours !== undefined) {
          const downtimeIcon = metric.downtime_hours === 0 ? '✅' : metric.downtime_hours < 24 ? '⚠️' : '🔴';
          summary += `   ${downtimeIcon} Downtime: ${metric.downtime_hours.toFixed(2)} hours\n`;
        }
        
        if (metric.specific_yield_kwh_kwp !== undefined) {
          summary += `   📈 Specific Yield: ${metric.specific_yield_kwh_kwp.toFixed(2)} kWh/kWp\n`;
        }
        
        summary += '\n';
      });
    } else {
      summary += 'No performance metrics available for the specified period.';
    }

    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
      structuredContent,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch performance metrics';
    
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching performance metrics: ${errorMessage}`,
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
