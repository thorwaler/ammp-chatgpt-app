/**
 * Next.js API Route for MCP Server
 * Deployed on Vercel for production
 */

import { createMcpServer } from '../../../src/server/mcpServer';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Health check endpoint
  return new Response(
    JSON.stringify({
      name: 'ammp-chatgpt-app',
      version: '1.0.0',
      status: 'ok',
      message: 'AMMP MCP Server is running',
      endpoints: {
        mcp: '/api/mcp',
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Echo back for now - full MCP implementation coming
    return new Response(
      JSON.stringify({
        received: body,
        message: 'MCP server endpoint - full protocol support in progress',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Invalid JSON',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  // CORS preflight
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    },
  });
}
