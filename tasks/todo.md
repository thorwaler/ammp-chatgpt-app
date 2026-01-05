# AMMP API Integration - Task Plan

## Overview
Create a ChatGPT MCP app that connects to the AMMP API for energy monitoring data. The app will:
- Collect API credentials from users via chat
- Authenticate and generate bearer tokens
- Retrieve energy data, alerts, and performance metrics from all AMMP endpoints
- Display data with **interactive charts** (for energy/power time series) and **interactive tables** (for alerts)
- Support both individual site analysis and full portfolio views
- Prioritize: alerts (errors/urgent), daily energy data, and performance metrics

## Phase 1: Authentication & Setup ✅ COMPLETE
- [x] 1.1 Create AMMP API authentication tool
  - Accept API key from user
  - Generate bearer token via AMMP auth endpoint
  - Store token securely in widget state
  - Handle token refresh/expiration
  - ✅ Created: `src/server/tools/ammp-auth.ts`

- [x] 1.2 Create API client utility
  - Base HTTP client with bearer token authentication
  - Error handling for API responses
  - Rate limiting considerations
  - TypeScript types for AMMP API responses
  - ✅ Created: `src/server/ammp/client.ts`
  - ✅ Created: `src/server/ammp/types.ts`
  - ✅ Registered tools in MCP server

## Phase 2: Core API Tools ✅ COMPLETE
- [x] 2.1 Sites/Facilities tool
  - List all sites accessible to user
  - Get site details (location, capacity, etc.)
  - Return structured data for display
  - ✅ Implemented in `src/server/tools/ammp-sites.ts`

- [x] 2.2 Energy data tool
  - Fetch energy production data (single site or portfolio)
  - Support different time ranges (hour, day, week, month)
  - Default: Daily (last 24 hours)
  - Return data formatted for graphing (timestamps + values in kW/MW)
  - Aggregate data for portfolio view
  - ✅ Implemented in `src/server/tools/ammp-energy.ts`

- [x] 2.3 Performance metrics tool
  - Get asset performance data (single or portfolio)
  - System efficiency metrics
  - Availability and capacity factor
  - Performance ratio (PR)
  - Downtime tracking
  - ✅ Implemented in `src/server/tools/ammp-performance.ts`

- [x] 2.4 Alerts tool (PRIORITY)
  - Fetch active alerts (single site or all sites)
  - Alert history with date range filter
  - Filter by severity (error, warning, info)
  - Sort by urgency/timestamp
  - Return data formatted for table display with color coding
  - ✅ Implemented in `src/server/tools/ammp-alerts.ts`

- [x] 2.5 Additional AMMP endpoints
  - Devices/inverters data
  - Weather data (if available)
  - Financial/revenue data (if applicable)
  - Any other endpoints from AMMP API docs
  - ✅ Implemented: `src/server/tools/ammp-devices.ts`
  - ✅ Implemented: `src/server/tools/ammp-weather.ts`

- [x] All tools registered in MCP server with proper schemas and metadata

## Phase 3: Widget Components ✅ COMPLETE
- [x] 3.1 Authentication component
  - Input form for API key
  - Display authentication status
  - Clear/reset credentials option
  - Show available sites after auth
  - ✅ Implemented in `src/web/components/AuthComponent.tsx`

- [x] 3.2 Interactive energy chart component (PRIORITY #2)
  - Line/area chart for energy production over time (Recharts)
  - Tooltips showing exact values on hover
  - X-axis: timestamps (hourly/daily intervals)
  - Y-axis: Power in kW or MW (auto-scaling)
  - Time range selector (hour, day, week, month)
  - Portfolio mode: overlay multiple site series
  - Zoom and pan for detailed analysis
  - Legend with site names/colors
  - ✅ Implemented in `src/web/components/EnergyChart.tsx`

- [x] 3.3 Interactive alerts table component (PRIORITY #1)
  - Sortable columns (click to sort by timestamp, severity, site, message)
  - Color-coded severity badges (🔴 Error, 🟡 Warning, 🔵 Info)
  - Expandable rows for full alert details
  - Filter controls (by site, severity, date range)
  - Pagination for large datasets
  - Real-time update indicator
  - Export button for CSV download
  - ✅ Implemented in `src/web/components/AlertsTable.tsx`

- [x] 3.4 Site overview component
  - Grid of site information cards
  - Key metrics: capacity, current output, status
  - Site selection (dropdown or multi-select for portfolio)
  - "Show All Sites" toggle for portfolio view
  - Status indicators (online, offline, warning)
  - ✅ Implemented in `src/web/components/SiteSelector.tsx`

- [x] 3.5 Dashboard component
  - Main layout with tabs or sections:
    * Overview (key metrics)
    * Energy Production (charts)
    * Alerts (table)
    * Performance (metrics cards)
  - Responsive grid layout
  - Loading skeletons
  - Error boundaries for each section
  - ✅ Implemented in `src/web/App.tsx`

- [x] 3.6 Performance Dashboard
  - Metric cards with health indicators
  - Availability, PR, capacity factor displays
  - Color-coded health status (✅ ⚠️ 🔴)
  - ✅ Implemented in `src/web/components/PerformanceDashboard.tsx`

- [x] 3.7 Devices List
  - Device cards with status
  - Filter by type and status
  - Summary statistics
  - ✅ Implemented in `src/web/components/DevicesList.tsx`

- [x] 3.8 Styling & Responsive Design
  - Complete CSS with theme variables
  - Responsive layouts for mobile/tablet
  - Loading and error states
  - Hover effects and transitions
  - ✅ Implemented in `src/web/App.css`

- [x] 3.9 Build System
  - Widget bundler with esbuild
  - Single HTML file output
  - CDN integration for React/Recharts
  - ✅ Implemented in `scripts/build-widget.ts`

## Phase 4: MCP Server Integration
- [ ] 4.1 Register AMMP tools in MCP server
  - `authenticate_ammp`: Collect and verify API key
  - `list_sites`: Get user's sites
  - `get_energy_data`: Retrieve energy production data
  - `get_alerts`: Fetch alert information
  - `get_performance`: System performance metrics

- [ ] 4.2 Configure tool metadata
  - Descriptions for ChatGPT discovery
  - Input schemas with validation
  - Output templates pointing to widget
  - Tool accessibility settings

- [ ] 4.3 Widget resource registration
  - Register HTML widget resource
  - Set up CSP policies for AMMP API domain
  - Configure widget preferences

## Phase 5: Polish & Deployment ✅ COMPLETE
- [x] 5.1 Add CSV export functionality
  - Export alerts to CSV
  - Include all relevant fields
  - Timestamped filenames
  - ✅ Implemented in AlertsTable component

- [x] 5.2 Add refresh buttons
  - Refresh alerts data
  - Refresh energy data
  - Manual data reload
  - ✅ Implemented in AlertsTable and EnergyChart

- [x] 5.3 Add date shortcuts
  - "Today", "Yesterday"
  - "Last 7 Days", "Last 30 Days"
  - "This Week", "This Month"
  - ✅ Implemented in EnergyChart component

- [x] 5.4 Vercel deployment setup
  - Next.js API route for MCP endpoint
  - next.config.js configuration
  - vercel.json configuration
  - Environment variables template
  - ✅ Created: app/api/mcp/route.ts
  - ✅ Created: next.config.js
  - ✅ Created: vercel.json
  - ✅ Created: .env.example

- [x] 5.5 Deployment documentation
  - Comprehensive deployment guide
  - Multiple deployment options (Vercel, Railway, Docker, ngrok)
  - Configuration instructions
  - Troubleshooting guide
  - ✅ Created: DEPLOYMENT.md

- [x] 5.6 Project configuration
  - .gitignore file
  - Updated package.json with deploy scripts
  - Repository metadata
  - ✅ All configuration files created

## Phase 6: Advanced Features (Optional)
- [ ] 6.1 Real-time data refresh
  - WebSocket connection for live updates
  - Auto-refresh intervals
  - Background polling

- [ ] 6.2 Data caching
  - Cache API responses
  - Reduce API calls
  - Improve performance

- [ ] 6.3 Offline support
  - Service worker
  - Cached data access
  - Offline indicators

- [ ] 6.4 Push notifications
  - Critical alert notifications
  - Browser notifications API
  - Email alerts integration

## Phase 6: Error Handling & Polish
- [ ] 6.1 Authentication error handling
  - Invalid API key messages
  - Token expiration handling
  - Re-authentication flow

- [ ] 6.2 API error handling
  - Network errors
  - Rate limiting
  - Invalid parameters
  - Empty data states

- [ ] 6.3 Loading states
  - Skeleton screens for data loading
  - Progress indicators
  - Optimistic updates where appropriate

- [ ] 6.4 User experience polish
  - Toast notifications for actions
  - Confirmation dialogs
  - Help text and tooltips
  - Dark mode support

## Phase 7: Testing & Documentation
- [ ] 7.1 Test authentication flow
  - Valid credentials
  - Invalid credentials
  - Token refresh

- [ ] 7.2 Test data retrieval
  - All API endpoints
  - Different data ranges
  - Edge cases (no data, large datasets)

- [ ] 7.3 Test UI components
  - All visualization components
  - Responsive behavior
  - Error states

- [ ] 7.4 Create user documentation
  - How to get AMMP API key
  - Available commands/queries
  - Troubleshooting guide

## Technical Decisions
- **Visualization**: Interactive charts using Recharts (React-based)
- **Priority Endpoints**: 
  1. Alerts (all types, focus on errors/urgent)
  2. Energy data (daily priority, but support all ranges)
  3. Performance metrics
  4. All other endpoints accessible
- **Multi-site Support**: Both individual site and full portfolio views
- **State Management**: Widget state for token + selected sites, React state for UI
- **API Base URL**: https://data-api.ammp.io
- **Authentication**: Bearer token from API key
- **Widget Size**: Adaptive - inline for simple queries, fullscreen for dashboards
- **Default Time Range**: Daily (last 24 hours), with options for hourly/weekly/monthly

## Next Steps
1. Get approval on this plan
2. Start with Phase 1 (Authentication)
3. Incrementally build and test each phase
4. Deploy and iterate based on feedback

## Questions - ANSWERED ✓
1. ✓ **Priority endpoints**: Alerts, energy data, performance (make all accessible)
2. ✓ **Time ranges**: Daily is priority, support all ranges
3. ✓ **Alerts**: All types, focus on error and urgent alerts
4. ✓ **Multi-site**: Both portfolio view AND individual site selection
5. ✓ **Visualization**: Interactive charts (not plain text)
