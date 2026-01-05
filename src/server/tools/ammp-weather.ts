/**
 * AMMP Weather Data Tool
 * Fetches weather data including temperature, irradiance, wind speed, etc.
 */

import { z } from 'zod';
import { getAMPPClient } from '../ammp/client';

export const getWeatherDataTool = {
  name: 'get_ammp_weather',
  description: 'Get weather data for an AMMP site including temperature, irradiance, wind speed, humidity, and precipitation.',
  inputSchema: {
    site_id: z.string().describe('Site ID to fetch weather data for'),
    start_date: z.string().describe('Start date in ISO 8601 format (YYYY-MM-DD)'),
    end_date: z.string().describe('End date in ISO 8601 format (YYYY-MM-DD)'),
  },
};

export async function getWeatherDataHandler(args: {
  site_id: string;
  start_date: string;
  end_date: string;
}) {
  try {
    const client = getAMPPClient();
    
    if (!client.isAuthenticated()) {
      throw new Error('Not authenticated. Please authenticate with your AMMP API key first.');
    }

    const weatherResponse = await client.getWeatherData(
      args.site_id,
      args.start_date,
      args.end_date
    );

    // Calculate statistics
    const dataPoints = weatherResponse.data;
    const temps = dataPoints.map(d => d.temperature_c).filter(v => v !== undefined) as number[];
    const irradiances = dataPoints.map(d => d.irradiance_w_m2).filter(v => v !== undefined) as number[];
    const windSpeeds = dataPoints.map(d => d.wind_speed_m_s).filter(v => v !== undefined) as number[];

    const stats = {
      avg_temperature_c: temps.length > 0 ? temps.reduce((s, v) => s + v, 0) / temps.length : undefined,
      max_temperature_c: temps.length > 0 ? Math.max(...temps) : undefined,
      min_temperature_c: temps.length > 0 ? Math.min(...temps) : undefined,
      avg_irradiance_w_m2: irradiances.length > 0 ? irradiances.reduce((s, v) => s + v, 0) / irradiances.length : undefined,
      max_irradiance_w_m2: irradiances.length > 0 ? Math.max(...irradiances) : undefined,
      avg_wind_speed_m_s: windSpeeds.length > 0 ? windSpeeds.reduce((s, v) => s + v, 0) / windSpeeds.length : undefined,
      data_points: dataPoints.length,
    };

    const structuredContent = {
      success: true,
      site_id: args.site_id,
      period: {
        start: args.start_date,
        end: args.end_date,
      },
      statistics: stats,
      data: dataPoints.map(point => ({
        timestamp: point.timestamp,
        temperature_c: point.temperature_c,
        irradiance_w_m2: point.irradiance_w_m2,
        wind_speed_m_s: point.wind_speed_m_s,
        humidity_percent: point.humidity_percent,
        precipitation_mm: point.precipitation_mm,
      })),
    };

    // Create formatted text summary
    let summary = `🌤️ Weather data for site ${args.site_id}\n\n`;
    summary += `Period: ${args.start_date} to ${args.end_date}\n`;
    summary += `Data Points: ${dataPoints.length}\n\n`;

    summary += `Statistics:\n`;
    if (stats.avg_temperature_c !== undefined) {
      summary += `• Temperature: ${stats.min_temperature_c?.toFixed(1)}°C - ${stats.max_temperature_c?.toFixed(1)}°C (avg: ${stats.avg_temperature_c.toFixed(1)}°C)\n`;
    }
    if (stats.avg_irradiance_w_m2 !== undefined) {
      summary += `• Irradiance: avg ${stats.avg_irradiance_w_m2.toFixed(0)} W/m², peak ${stats.max_irradiance_w_m2?.toFixed(0)} W/m²\n`;
    }
    if (stats.avg_wind_speed_m_s !== undefined) {
      summary += `• Wind Speed: avg ${stats.avg_wind_speed_m_s.toFixed(1)} m/s\n`;
    }
    summary += '\n';

    // Show sample data points
    const samplePoints = dataPoints.slice(0, 5);
    if (samplePoints.length > 0) {
      summary += `Sample Data (first ${samplePoints.length} points):\n\n`;
      samplePoints.forEach(point => {
        const timestamp = new Date(point.timestamp).toLocaleString();
        summary += `${timestamp}\n`;
        if (point.temperature_c !== undefined) {
          summary += `  Temp: ${point.temperature_c.toFixed(1)}°C`;
        }
        if (point.irradiance_w_m2 !== undefined) {
          summary += ` | Irradiance: ${point.irradiance_w_m2.toFixed(0)} W/m²`;
        }
        if (point.wind_speed_m_s !== undefined) {
          summary += ` | Wind: ${point.wind_speed_m_s.toFixed(1)} m/s`;
        }
        summary += '\n';
      });
      
      if (dataPoints.length > 5) {
        summary += `\n...and ${dataPoints.length - 5} more data points.`;
      }
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: summary,
        },
      ],
      structuredContent,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather data';
    
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error fetching weather data: ${errorMessage}`,
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
