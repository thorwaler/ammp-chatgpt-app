/**
 * Local Development Server for MCP
 * Run with: npm run dev:local
 * Expose with: ngrok http 3000
 */
import { createServer } from 'http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcpServer';

const port = Number(process.env.PORT ?? 3000);
const MCP_PATH = '/mcp';

const httpServer = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end('Missing URL');
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'content-type, mcp-session-id',
      'Access-Control-Expose-Headers': 'Mcp-Session-Id',
    });
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'content-type': 'application/json' }).end(
      JSON.stringify({
        name: 'AMMP ChatGPT App MCP Server',
        version: '1.0.0',
        status: 'ok',
        endpoints: {
          mcp: MCP_PATH,
          health: '/',
        },
      })
    );
    return;
  }

  // MCP endpoint
  const MCP_METHODS = new Set(['POST', 'GET', 'DELETE']);
  if (url.pathname.startsWith(MCP_PATH) && req.method && MCP_METHODS.has(req.method)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
      enableJsonResponse: true,
    });

    res.on('close', () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.writeHead(500).end('Internal server error');
      }
    }
    return;
  }

  res.writeHead(404).end('Not Found');
});

httpServer.listen(port, () => {
  console.log(`\n🚀 AMMP ChatGPT App MCP Server`);
  console.log(`   Local:  http://localhost:${port}${MCP_PATH}`);
  console.log(`   Health: http://localhost:${port}/\n`);
  console.log(`📝 Next steps:`);
  console.log(`   1. Expose with: ngrok http ${port}`);
  console.log(`   2. Add connector in ChatGPT developer mode`);
  console.log(`   3. Use the ngrok URL: https://<subdomain>.ngrok.app${MCP_PATH}\n`);
});
