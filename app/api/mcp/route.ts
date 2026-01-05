/**
 * Next.js API Route for MCP Server
 * Deployed on Vercel for production
 */

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from '../../../src/server/mcpServer';
import type { NextRequest } from 'next/server';

// Disable body parsing - we need the raw request
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(request: NextRequest) {
  return handleMcpRequest(request);
}

export async function POST(request: NextRequest) {
  return handleMcpRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleMcpRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  // CORS preflight
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'content-type, mcp-session-id',
      'Access-Control-Expose-Headers': 'Mcp-Session-Id',
    },
  });
}

async function handleMcpRequest(request: NextRequest): Promise<Response> {
  try {
    // Create MCP server instance
    const server = createMcpServer();
    
    // Create transport (stateless mode for Vercel)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless
      enableJsonResponse: true,
    });

    // Connect server to transport
    await server.connect(transport);

    // Convert Next.js request to Node.js-compatible format
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const nodeRequest = {
      method: request.method,
      url: request.url,
      headers,
      body: request.body,
    };

    // Handle the request
    const responseData = await transport.handleRequest(
      nodeRequest as any,
      {} as any
    );

    // Return response with CORS headers
    return new Response(responseData.body, {
      status: responseData.statusCode || 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Mcp-Session-Id',
        ...(responseData.headers || {}),
      },
    });
  } catch (error) {
    console.error('MCP request error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
