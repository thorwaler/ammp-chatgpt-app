/**
 * MCP Server Factory for Local Development
 * Updated with ALL AMMP API tools
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { authenticateAmmpHandler } from './tools/ammp-auth';
import { listSitesHandler } from './tools/ammp-sites';
import { getAlertsHandler } from './tools/ammp-alerts';
import { getEnergyDataHandler } from './tools/ammp-energy';
import { getPerformanceHandler } from './tools/ammp-performance';
import { getDevicesHandler } from './tools/ammp-devices';
import { getWeatherDataHandler } from './tools/ammp-weather';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load widget HTML
function getWidgetHtml(): string {
  const possiblePaths = [
    join(process.cwd(), 'public', 'widget.html'),
    join(dirname(fileURLToPath(import.meta.url)), '../../public/widget.html'),
    join(dirname(fileURLToPath(import.meta.url)), '../../../public/widget.html'),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return readFileSync(path, 'utf8');
    }
  }

  // Fallback minimal HTML
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /></head>
<body><div id="root">Widget not found. Please build with npm run build:widget</div></body>
</html>`;
}

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'ammp-chatgpt-app',
    version: '1.0.0',
  });

  const widgetHtml = getWidgetHtml();

  // Register widget resource
  server.resource(
    'ammp-widget',
    'ui://widget/ammp.html',
    async () => ({
      contents: [
        {
          uri: 'ui://widget/ammp.html',
          mimeType: 'text/html+skybridge',
          text: widgetHtml,
          _meta: {
            'openai/widgetPrefersBorder': true,
            'openai/widgetDomain': 'https://chatgpt.com',
            'openai/widgetCSP': {
              connect_domains: ['https://data-api.ammp.io'],
              resource_domains: ['https://*.oaistatic.com'],
            },
          },
        },
      ],
    })
  );

  // Tool 1: Authenticate with AMMP
  server.tool(
    'authenticate_ammp',
    'Authenticate with AMMP API using an API key. This must be done first before accessing any AMMP data. Returns authentication status and list of accessible sites.',
    {
      api_key: z.string().min(10).describe('AMMP API key provided by the user'),
    },
    async (args) => {
      const result = await authenticateAmmpHandler(args);
      
      // Add widget template to metadata
      if (result._meta) {
        result._meta['openai/outputTemplate'] = 'ui://widget/ammp.html';
        result._meta['openai/toolInvocation/invoking'] = 'Authenticating with AMMP...';
        result._meta['openai/toolInvocation/invoked'] = 'Authentication complete';
      }
      
      return result;
    }
  );

  // Tool 2: List sites
  server.tool(
    'list_ammp_sites',
    'List all AMMP sites/facilities accessible to the authenticated user. Shows site details including name, capacity, status, and location.',
    {},
    async () => {
      const result = await listSitesHandler();
      
      if (result._meta) {
        result._meta['openai/outputTemplate'] = 'ui://widget/ammp.html';
      }
      
      return result;
    }
  );

  // Tool 3: Get Alerts (PRIORITY #1)
  server.tool(
    'get_ammp_alerts',
    'Get alerts for AMMP sites. Can fetch alerts for a specific site or all sites (portfolio view). Supports filtering by severity (error, warning, info) and status. Prioritizes error and urgent alerts.',
    {
      site_id: z.string().optional().describe('Specific site ID, or omit for all sites (portfolio)'),
      severity: z.array(z.enum(['error', 'warning', 'info'])).optional().describe('Filter by severity levels. Default shows all, but errors are prioritized'),
      status: z.array(z.enum(['active', 'resolved', 'acknowledged'])).optional().describe('Filter by alert status. Default shows active alerts'),
      start_date: z.string().optional().describe('Start date in ISO 8601 format (YYYY-MM-DD). Defaults to last 7 days'),
      end_date: z.string().optional().describe('End date in ISO 8601 format (YYYY-MM-DD). Defaults to now'),
      limit: z.number().optional().describe('Maximum number of alerts to return. Default 100'),
    },
    async (args) => {
      const result = await getAlertsHandler(args);
      
      if (result._meta) {
        result._meta['openai/outputTemplate'] = 'ui://widget/ammp.html';
        result._meta['openai/toolInvocation/invoking'] = 'Fetching alerts...';
        result._meta['openai/toolInvocation/invoked'] = 'Alerts retrieved';
      }
      
      return result;
    }
  );

  // Tool 4: Get Energy Data (PRIORITY #2)
  server.tool(
    'get_ammp_energy_data',
    'Get energy production time series data for AMMP sites. Can fetch data for a specific site or all sites combined (portfolio view). Supports multiple time intervals with daily being the default. Returns data formatted for interactive charts.',
    {
      site_id: z.string().optional().describe('Specific site ID, or omit for portfolio aggregation'),
      start_date: z.string().describe('Start date in ISO 8601 format (YYYY-MM-DD)'),
      end_date: z.string().describe('End date in ISO 8601 format (YYYY-MM-DD)'),
      interval: z.enum(['hour', 'day', 'week', 'month']).optional().describe('Time interval for aggregation. Default is "day" (24-hour periods)'),
      metrics: z.array(z.enum(['energy', 'power', 'irradiance'])).optional().describe('Metrics to include. Default includes energy and power'),
    },
    async (args) => {
      const result = await getEnergyDataHandler(args);
      
      if (result._meta) {
        result._meta['openai/outputTemplate'] = 'ui://widget/ammp.html';
        result._meta['openai/toolInvocation/invoking'] = 'Fetching energy data...';
        result._meta['openai/toolInvocation/invoked'] = 'Energy data retrieved';
      }
      
      return result;
    }
  );

  // Tool 5: Get Performance Metrics (PRIORITY #3)
  server.tool(
    'get_ammp_performance',
    'Get performance metrics for AMMP sites including availability, capacity factor, performance ratio (PR), and downtime. Can fetch for a specific site or portfolio aggregation.',
    {
      site_id: z.string().optional().describe('Specific site ID, or omit for portfolio summary'),
      start_date: z.string().describe('Start date in ISO 8601 format (YYYY-MM-DD)'),
      end_date: z.string().describe('End date in ISO 8601 format (YYYY-MM-DD)'),
      aggregation: z.enum(['daily', 'weekly', 'monthly']).optional().describe('Aggregation level. Default is daily'),
    },
    async (args) => {
      const result = await getPerformanceHandler(args);
      
      if (result._meta) {
        result._meta['openai/outputTemplate'] = 'ui://widget/ammp.html';
        result._meta['openai/toolInvocation/invoking'] = 'Fetching performance metrics...';
        result._meta['openai/toolInvocation/invoked'] = 'Performance metrics retrieved';
      }
      
      return result;
    }
  );

  // Tool 6: Get Devices
  server.tool(
    'get_ammp_devices',
    'Get device and inverter information for an AMMP site. Shows equipment details, status, and last communication times.',
    {
      site_id: z.string().describe('Site ID to fetch devices for'),
    },
    async (args) => {
      const result = await getDevicesHandler(args);
      
      if (result._meta) {
        result._meta['openai/outputTemplate'] = 'ui://widget/ammp.html';
      }
      
      return result;
    }
  );

  // Tool 7: Get Weather Data
  server.tool(
    'get_ammp_weather',
    'Get weather data for an AMMP site including temperature, irradiance, wind speed, humidity, and precipitation.',
    {
      site_id: z.string().describe('Site ID to fetch weather data for'),
      start_date: z.string().describe('Start date in ISO 8601 format (YYYY-MM-DD)'),
      end_date: z.string().describe('End date in ISO 8601 format (YYYY-MM-DD)'),
    },
    async (args) => {
      const result = await getWeatherDataHandler(args);
      
      if (result._meta) {
        result._meta['openai/outputTemplate'] = 'ui://widget/ammp.html';
      }
      
      return result;
    }
  );

  return server;
}
