# AMMP ChatGPT App

A ChatGPT MCP app that integrates with the AMMP API for solar energy monitoring and analysis.

## Features

- 🔐 **API Key Authentication** - Secure bearer token authentication with AMMP
- 📊 **Interactive Energy Charts** - Visualize energy production data with Recharts
- ⚠️ **Alert Management** - View and filter alerts by severity and site
- 📈 **Performance Metrics** - Track system efficiency, availability, and performance ratio
- 🏢 **Portfolio & Site Views** - Analyze individual sites or entire portfolio

## Setup

### Prerequisites

- Node.js 18+
- AMMP API key (get from https://data-api.ammp.io)
- ngrok (for local development)

### Installation

```bash
# Install dependencies
npm install

# Build the widget
npm run build:widget

# Start local development server
npm run dev:local

# In another terminal, expose with ngrok
ngrok http 3000
```

### Add to ChatGPT

1. Enable [developer mode](https://platform.openai.com/docs/guides/developer-mode) in ChatGPT
2. Go to **Settings → Connectors → Create**
3. Use your ngrok URL with `/mcp` endpoint: `https://<subdomain>.ngrok.app/mcp`
4. Start a conversation and authenticate with your API key

## Project Structure

```
├── src/
│   ├── server/
│   │   ├── ammp/
│   │   │   ├── client.ts        # AMMP API client
│   │   │   └── types.ts         # TypeScript types
│   │   ├── tools/
│   │   │   ├── ammp-auth.ts     # Authentication tool
│   │   │   ├── ammp-sites.ts    # Sites listing tool
│   │   │   ├── ammp-energy.ts   # Energy data tool (TODO)
│   │   │   ├── ammp-alerts.ts   # Alerts tool (TODO)
│   │   │   └── ammp-performance.ts # Performance tool (TODO)
│   │   ├── mcpServer.ts         # MCP server with tools
│   │   └── dev.ts               # Local dev server
│   └── web/
│       ├── components/          # React components (TODO)
│       ├── hooks/               # React hooks (TODO)
│       └── App.tsx              # Main widget (TODO)
├── app/
│   └── api/mcp/route.ts        # Vercel deployment (TODO)
├── public/
│   └── widget.html             # Built widget (generated)
└── scripts/
    └── build-widget.ts         # Widget build script (TODO)
```

## Available MCP Tools

### ✅ Implemented

1. **`authenticate_ammp`** - Authenticate with AMMP API
   - Input: `api_key` (string)
   - Returns: Authentication status and list of sites

2. **`list_ammp_sites`** - List all accessible sites
   - No inputs required
   - Returns: Site details (name, capacity, status, location)

### 🚧 In Progress

3. **`get_energy_data`** - Fetch energy production data
4. **`get_alerts`** - Get alerts for sites
5. **`get_performance`** - Performance metrics

## Usage Examples

```
User: "Authenticate with my AMMP API key: abc123..."
Assistant: [calls authenticate_ammp tool]

User: "Show me all my sites"
Assistant: [calls list_ammp_sites tool]

User: "What's the energy production for Site Alpha today?"
Assistant: [calls get_energy_data tool with site_id and date range]

User: "Show me all error alerts across my portfolio"
Assistant: [calls get_alerts with severity filter]
```

## Development Status

- ✅ Phase 1: Authentication & API Client
- 🚧 Phase 2: Core API Tools (in progress)
- ⏳ Phase 3: Widget Components
- ⏳ Phase 4: MCP Server Integration
- ⏳ Phase 5: Interactive Visualizations
- ⏳ Phase 6: Error Handling & Polish
- ⏳ Phase 7: Testing & Documentation

## API Documentation

Full AMMP API docs: https://data-api.ammp.io/docs

## License

MIT
