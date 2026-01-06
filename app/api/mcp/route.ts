/**
 * Vercel MCP Server - Stateless JSON-RPC 2.0 Implementation
 * Full MCP protocol support for ChatGPT integration
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

// Import tool handlers
import { authenticateAmmpHandler } from '../../../src/server/tools/ammp-auth';
import { listSitesHandler } from '../../../src/server/tools/ammp-sites';
import { getAlertsHandler } from '../../../src/server/tools/ammp-alerts';
import { getEnergyDataHandler } from '../../../src/server/tools/ammp-energy';
import { getPerformanceHandler } from '../../../src/server/tools/ammp-performance';
import { getDevicesHandler } from '../../../src/server/tools/ammp-devices';
import { getWeatherHandler } from '../../../src/server/tools/ammp-weather';

// Tool definitions
const TOOLS = [
  {
    name: 'authenticate_ammp',
    description: 'Authenticate with AMMP API using an API key. This must be done first before accessing any AMMP data. Returns authentication status and list of accessible sites.',
    inputSchema: {
      type: 'object',
      properties: {
        api_key: {
          type: 'string',
          description: 'AMMP API key provided by the user',
        },
      },
      required: ['api_key'],
    },
  },
  {
    name: 'list_ammp_sites',
    description: 'List all AMMP sites/facilities accessible to the authenticated user. Shows site details including name, capacity, status, and location.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_ammp_alerts',
    description: 'Get alerts for AMMP sites. Can fetch alerts for a specific site or all sites (portfolio view). Supports filtering by severity (error, warning, info) and status. Prioritizes error and urgent alerts.',
    inputSchema: {
      type: 'object',
      properties: {
        site_id: {
          type: 'string',
          description: 'Specific site ID, or omit for all sites (portfolio)',
        },
        severity: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['error', 'warning', 'info'],
          },
          description: 'Filter by severity levels. Default shows all, but errors are prioritized',
        },
        status: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['active', 'resolved', 'acknowledged'],
          },
          description: 'Filter by alert status. Default shows active alerts',
        },
        start_date: {
          type: 'string',
          description: 'Start date in ISO 8601 format (YYYY-MM-DD). Defaults to last 7 days',
        },
        end_date: {
          type: 'string',
          description: 'End date in ISO 8601 format (YYYY-MM-DD). Defaults to now',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of alerts to return. Default 100',
        },
      },
    },
  },
  {
    name: 'get_ammp_energy_data',
    description: 'Get energy production data for AMMP sites. Returns time-series data of energy generation (kWh) and power output (kW). Supports different time intervals (hour, day, week, month).',
    inputSchema: {
      type: 'object',
      properties: {
        site_id: {
          type: 'string',
          description: 'Specific site ID, or omit for all sites',
        },
        start_date: {
          type: 'string',
          description: 'Start date in ISO 8601 format (YYYY-MM-DD)',
        },
        end_date: {
          type: 'string',
          description: 'End date in ISO 8601 format (YYYY-MM-DD)',
        },
        interval: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month'],
          description: 'Data aggregation interval. Default: day',
        },
      },
    },
  },
  {
    name: 'get_ammp_performance',
    description: 'Get performance metrics for AMMP sites including PR (Performance Ratio), availability, and capacity factor. Essential for understanding system efficiency.',
    inputSchema: {
      type: 'object',
      properties: {
        site_id: {
          type: 'string',
          description: 'Specific site ID, or omit for all sites',
        },
        start_date: {
          type: 'string',
          description: 'Start date in ISO 8601 format (YYYY-MM-DD)',
        },
        end_date: {
          type: 'string',
          description: 'End date in ISO 8601 format (YYYY-MM-DD)',
        },
      },
    },
  },
  {
    name: 'get_ammp_devices',
    description: 'Get status and details of devices (inverters, meters, etc.) at AMMP sites. Shows operational status, last communication, and device health.',
    inputSchema: {
      type: 'object',
      properties: {
        site_id: {
          type: 'string',
          description: 'Specific site ID to get devices for',
        },
      },
    },
  },
  {
    name: 'get_ammp_weather',
    description: 'Get current and forecast weather data for AMMP site locations including irradiance, temperature, and weather conditions.',
    inputSchema: {
      type: 'object',
      properties: {
        site_id: {
          type: 'string',
          description: 'Specific site ID to get weather for',
        },
      },
    },
  },
];

// Tool handler mapping
const TOOL_HANDLERS: Record<string, Function> = {
  authenticate_ammp: authenticateAmmpHandler,
  list_ammp_sites: listSitesHandler,
  get_ammp_alerts: getAlertsHandler,
  get_ammp_energy_data: getEnergyDataHandler,
  get_ammp_performance: getPerformanceHandler,
  get_ammp_devices: getDevicesHandler,
  get_ammp_weather: getWeatherHandler,
};

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-AMMP-API-Key',
  'Access-Control-Expose-Headers': 'X-Request-ID',
};

// JSON-RPC 2.0 response helper
function jsonRpcResponse(id: any, result?: any, error?: any) {
  const response: any = {
    jsonrpc: '2.0',
    id,
  };

  if (error) {
    response.error = {
      code: error.code || -32603,
      message: error.message || 'Internal error',
      data: error.data,
    };
  } else {
    response.result = result;
  }

  return response;
}

// Handle MCP protocol methods
async function handleMcpRequest(request: any, apiKey?: string) {
  const { method, params, id } = request;

  try {
    switch (method) {
      case 'initialize':
        return jsonRpcResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'ammp-chatgpt-app',
            version: '1.0.0',
          },
        });

      case 'tools/list':
        return jsonRpcResponse(id, {
          tools: TOOLS,
        });

      case 'tools/call':
        const { name, arguments: args } = params;

        if (!TOOL_HANDLERS[name]) {
          return jsonRpcResponse(id, null, {
            code: -32601,
            message: `Tool not found: ${name}`,
          });
        }

        // Call the tool handler
        const result = await TOOL_HANDLERS[name](args || {});

        return jsonRpcResponse(id, result);

      case 'ping':
        return jsonRpcResponse(id, {});

      default:
        return jsonRpcResponse(id, null, {
          code: -32601,
          message: `Method not found: ${method}`,
        });
    }
  } catch (error) {
    console.error('MCP request error:', error);
    return jsonRpcResponse(id, null, {
      code: -32603,
      message: error instanceof Error ? error.message : 'Internal error',
      data: error instanceof Error ? error.stack : undefined,
    });
  }
}

// GET handler - Health check
export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      name: 'ammp-chatgpt-app',
      version: '1.0.0',
      status: 'ok',
      message: 'AMMP MCP Server - Full Protocol Support',
      protocol: 'MCP 2024-11-05',
      tools: TOOLS.length,
      endpoints: {
        mcp: '/api/mcp',
        widget: '/widget.html',
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    }
  );
}

// POST handler - MCP protocol
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get API key from header if provided
    const apiKey = request.headers.get('X-AMMP-API-Key') || 
                   request.headers.get('Authorization')?.replace('Bearer ', '');

    // Handle single request
    if (!Array.isArray(body)) {
      const response = await handleMcpRequest(body, apiKey);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      });
    }

    // Handle batch requests
    const responses = await Promise.all(
      body.map(req => handleMcpRequest(req, apiKey))
    );

    return new Response(JSON.stringify(responses), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.error('Request error:', error);

    return new Response(
      JSON.stringify(
        jsonRpcResponse(null, null, {
          code: -32700,
          message: 'Parse error',
          data: error instanceof Error ? error.message : 'Invalid JSON',
        })
      ),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
}

// OPTIONS handler - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
