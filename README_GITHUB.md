# AMMP Energy Monitor - ChatGPT MCP App

A production-ready ChatGPT MCP application for monitoring AMMP solar energy systems with interactive Recharts visualizations and real-time alerts.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 🌟 Features

### Priority Features
- 🚨 **Alert Management** (Priority #1) - Interactive sortable table with color-coded severity, filtering, and CSV export
- ⚡ **Energy Visualization** (Priority #2) - Interactive Recharts with dual Y-axis, multiple time intervals, and date shortcuts
- 📈 **Performance Metrics** (Priority #3) - Health-coded dashboards with availability, PR, capacity factor, and downtime tracking

### Additional Capabilities
- 🔐 Secure API key authentication with automatic token refresh
- 🏢 Portfolio and individual site views
- 🔧 Device and inverter status monitoring
- 🌤️ Weather data integration
- 📱 Responsive design (desktop, tablet, mobile)
- 📥 CSV export for alerts
- 🔄 Manual refresh buttons
- 📅 Quick date shortcuts (Today, Yesterday, Last 7/30 Days, This Week/Month)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AMMP API key from [data-api.ammp.io](https://data-api.ammp.io)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ammp-chatgpt-app.git
cd ammp-chatgpt-app

# Install dependencies
npm install

# Build the widget
npm run build:widget

# Start local development
npm run dev:local
```

### Deploy to Production (Vercel - Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod

# Your app will be live at: https://your-app.vercel.app
```

### Add to ChatGPT

1. Enable [developer mode](https://platform.openai.com/docs/guides/developer-mode) in ChatGPT
2. Go to Settings → Connectors → Create
3. Add your MCP endpoint: `https://your-app.vercel.app/api/mcp`
4. Name it: "AMMP Energy Monitor"

## 📊 Architecture

### Backend (MCP Server)
- **7 MCP Tools** covering all AMMP API endpoints
- TypeScript with Zod validation
- Automatic bearer token management
- Error handling and rate limiting

### Frontend (React Widget)
- **7 Interactive Components** including Recharts visualizations
- ~2,500 lines of TypeScript + React
- ~500 lines of custom CSS
- Responsive grid layouts
- Real-time data updates via postMessage

### Deployment
- **Vercel-ready** with Next.js API routes
- **Railway, Docker, ngrok** alternatives supported
- Stateless architecture for serverless deployment
- Auto-scaling and edge optimization

## 📁 Project Structure

```
ammp-chatgpt-app/
├── app/api/mcp/           # Vercel API endpoint
├── src/
│   ├── server/            # MCP server & tools
│   │   ├── ammp/          # API client & types
│   │   └── tools/         # 7 MCP tools
│   └── web/               # React widget
│       ├── components/    # 7 UI components
│       ├── App.tsx        # Main app
│       └── App.css        # Styling
├── scripts/               # Build scripts
├── public/                # Built widget
├── DEPLOYMENT.md          # Deployment guide
└── package.json           # Dependencies & scripts
```

## 🛠️ Available Scripts

```bash
npm run dev              # Next.js development server
npm run build            # Build for production
npm start                # Start production server
npm run dev:local        # Local MCP server (for testing)
npm run build:widget     # Build React widget
npm run deploy           # Deploy to Vercel (production)
npm run deploy:preview   # Deploy to Vercel (preview)
```

## 🔧 Configuration

Create `.env.local`:
```bash
AMMP_BASE_URL=https://data-api.ammp.io
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 📖 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide (Vercel, Railway, Docker, ngrok)
- **[PHASE-2-COMPLETE.md](./PHASE-2-COMPLETE.md)** - MCP tools documentation
- **[PHASE-3-COMPLETE.md](./PHASE-3-COMPLETE.md)** - React components documentation  
- **[PHASE-5-COMPLETE.md](./PHASE-5-COMPLETE.md)** - Polish features & deployment

## 🎯 Usage Examples

### Authentication
```
User: "Authenticate with my AMMP API key: abc123..."
→ Successfully authenticated. Found 5 sites.
```

### Alerts (Priority #1)
```
User: "Show me all error alerts"
→ 🔴 Found 3 error alerts:
   1. Inverter Fault - Site Alpha - Jan 5, 14:23
```

### Energy Data (Priority #2)
```
User: "What's today's energy production?"
→ 📊 Total Energy: 1,245.67 kWh | Peak Power: 345.89 kW
   [Interactive Recharts visualization displayed]
```

### Performance (Priority #3)
```
User: "Show portfolio performance this week"
→ ✅ Avg Availability: 96.8% | Total Energy: 45,678 kWh
   [Health-coded metric cards displayed]
```

## 🔐 Security

- API keys encrypted in transit
- Bearer tokens auto-refresh
- CORS configured for ChatGPT
- Environment variables for secrets
- No client-side API key storage

## 📊 Tech Stack

- **Backend:** Node.js, TypeScript, MCP SDK, Zod
- **Frontend:** React 18, Recharts 2.10, Vanilla CSS
- **Deployment:** Vercel/Next.js (recommended), Railway, Docker
- **Build:** esbuild, Next.js compiler

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- Visualizations powered by [Recharts](https://recharts.org)
- Deployed on [Vercel](https://vercel.com)

## 📞 Support

- **Deployment Issues:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Questions:** Check [data-api.ammp.io](https://data-api.ammp.io)
- **Bug Reports:** Open a GitHub issue

---

**Built with ❤️ for solar energy monitoring**

⭐ Star this repo if you find it useful!
