# Phase 2 Complete! ✅ Core API Tools (MCP)

## What We Built

We've created **7 comprehensive MCP tools** that integrate with all major AMMP API endpoints:

### Priority Tools (Built First)

#### 1. 🚨 **Alerts Tool** (Priority #1 - MOST IMPORTANT)
**File:** `src/server/tools/ammp-alerts.ts`

**Features:**
- Fetch alerts for specific site or entire portfolio
- Filter by severity: `error`, `warning`, `info`
- Filter by status: `active`, `resolved`, `acknowledged`
- Default: Last 7 days of active alerts
- **Smart sorting**: Errors first, then warnings, then info, then by timestamp
- Returns severity counts and formatted summary
- Supports pagination (limit parameter)

**Parameters:**
```typescript
{
  site_id?: string,           // Optional, omit for all sites
  severity?: AlertSeverity[],  // ['error', 'warning', 'info']
  status?: AlertStatus[],      // ['active', 'resolved', 'acknowledged']
  start_date?: string,         // ISO 8601, defaults to 7 days ago
  end_date?: string,           // ISO 8601, defaults to now
  limit?: number               // Default 100
}
```

**Output Features:**
- 🔴 Error count
- 🟡 Warning count  
- 🔵 Info count
- Top 10 alerts shown in text (sorted by severity)
- Full structured data for widget rendering
- Icons for visual severity indication

---

#### 2. 📊 **Energy Data Tool** (Priority #2)
**File:** `src/server/tools/ammp-energy.ts`

**Features:**
- Time series energy production data
- Single site OR portfolio aggregation
- Multiple intervals: `hour`, `day`, `week`, `month` (default: day)
- Multiple metrics: `energy` (kWh), `power` (kW), `irradiance` (W/m²)
- Statistics calculation: total energy, avg/peak power
- **Formatted for interactive Recharts visualization**

**Parameters:**
```typescript
{
  site_id?: string,                              // Optional, omit for portfolio
  start_date: string,                            // Required: YYYY-MM-DD
  end_date: string,                              // Required: YYYY-MM-DD
  interval?: 'hour' | 'day' | 'week' | 'month', // Default: 'day'
  metrics?: ('energy' | 'power' | 'irradiance')[] // Default: ['energy', 'power']
}
```

**Output Features:**
- Total energy produced (kWh)
- Average power (kW)
- Peak power (kW)
- Number of data points
- Sample data preview (first 5 points)
- Full time series in metadata for charting

---

#### 3. 📈 **Performance Metrics Tool** (Priority #3)
**File:** `src/server/tools/ammp-performance.ts`

**Features:**
- System efficiency and availability metrics
- Single site OR portfolio summary
- Multiple aggregations: `daily`, `weekly`, `monthly`
- Key metrics with health indicators (✅ ⚠️ 🔴)

**Parameters:**
```typescript
{
  site_id?: string,                              // Optional, omit for portfolio
  start_date: string,                            // Required: YYYY-MM-DD
  end_date: string,                              // Required: YYYY-MM-DD
  aggregation?: 'daily' | 'weekly' | 'monthly'   // Default: 'daily'
}
```

**Metrics Tracked:**
- ✅ **Availability %** (>95% = healthy, 90-95% = warning, <90% = critical)
- 📊 **Capacity Factor %**
- ✅ **Performance Ratio %** (>80% = healthy, 70-80% = warning, <70% = critical)
- ⚡ **Total Energy** (actual vs expected)
- ⏱️ **Downtime Hours** (0 = healthy, <24 = warning, >24 = critical)
- 📈 **Specific Yield** (kWh/kWp)

**Portfolio Summary:**
- Total energy across all sites
- Average availability
- Average performance ratio
- Total capacity

---

### Additional Tools

#### 4. 📍 **Sites Listing Tool**
**File:** `src/server/tools/ammp-sites.ts`

Lists all accessible sites with:
- Site name
- Capacity (kW)
- Status (active/inactive/maintenance)
- Location (address, lat/long)
- Commissioned date

---

#### 5. 🔧 **Devices Tool**
**File:** `src/server/tools/ammp-devices.ts`

**Features:**
- List all devices/inverters for a site
- Device types: inverter, meter, sensor, tracker, other
- Status tracking: online, offline, fault
- Last communication timestamp

**Parameters:**
```typescript
{
  site_id: string  // Required
}
```

**Output:**
- Device count by type
- Status breakdown (online/offline/fault)
- Full device details with icons (✅ 🔴 ⚠️)
- Manufacturer and model info
- Capacity per device

---

#### 6. 🌤️ **Weather Data Tool**
**File:** `src/server/tools/ammp-weather.ts`

**Features:**
- Weather data for site location
- Multiple metrics tracked
- Statistical summary

**Parameters:**
```typescript
{
  site_id: string,      // Required
  start_date: string,   // Required: YYYY-MM-DD
  end_date: string      // Required: YYYY-MM-DD
}
```

**Metrics:**
- 🌡️ **Temperature** (°C) - min/max/average
- ☀️ **Irradiance** (W/m²) - average/peak
- 💨 **Wind Speed** (m/s) - average
- 💧 **Humidity** (%)
- 🌧️ **Precipitation** (mm)

---

#### 7. 🔐 **Authentication Tool**
**File:** `src/server/tools/ammp-auth.ts`

**Features:**
- Converts API key → bearer token
- Validates credentials
- Returns list of accessible sites
- Stores token securely (not visible to model)
- Token expiration tracking

---

## MCP Server Configuration

**File:** `src/server/mcpServer.ts`

✅ **All 7 tools registered** with:
- Complete input schemas with Zod validation
- Descriptive help text for ChatGPT discovery
- Widget output templates
- Tool invocation messages ("Fetching alerts...", "Alerts retrieved")
- CSP policies for AMMP API domain
- Proper error handling

---

## Tool Usage Examples

### Example 1: Check for Critical Alerts
```
User: "Show me all error alerts across my sites"
Assistant: [calls get_ammp_alerts with severity=['error']]

Returns:
🔴 Found 3 error alerts for all sites:

Severity Breakdown:
• Errors: 3
• Warnings: 0
• Info: 0

Top 3 Alerts:
1. 🔴 Inverter Fault Detected
   Site: Solar Farm Alpha | 2026-01-05 14:23
   Inverter INV-3 has stopped responding...
```

### Example 2: Daily Energy Production
```
User: "What was the energy production for Site Alpha yesterday?"
Assistant: [calls get_ammp_energy_data with site_id, start_date, end_date]

Returns:
📊 Energy data for site Solar Farm Alpha (daily intervals)

Period: 2026-01-04 to 2026-01-05

Statistics:
• Total Energy: 1,245.67 kWh
• Average Power: 156.23 kW
• Peak Power: 345.89 kW
• Data Points: 24
```

### Example 3: Portfolio Performance
```
User: "Show me the performance metrics for all my sites this week"
Assistant: [calls get_ammp_performance with no site_id]

Returns:
📈 Performance metrics for portfolio

Portfolio Summary:
• Total Energy: 45,678.90 kWh
• Average Availability: 97.5%
• Average Performance Ratio: 82.3%
• Total Capacity: 2,500.00 kW
```

### Example 4: Device Status
```
User: "Are all inverters online at Site Beta?"
Assistant: [calls get_ammp_devices with site_id='beta']

Returns:
🔧 Devices for site Site Beta

Status Breakdown:
• ✅ Online: 15
• 🔴 Offline: 1
• ⚠️ Fault: 0

Device Types:
• inverter: 12
• meter: 3
• sensor: 1
```

---

## Tool Priority & Defaults

Based on requirements, tools are configured with smart defaults:

### Priority #1: Alerts
- Default: **Last 7 days**, **active only**
- Sorted by: **Errors first**, then warnings, then info
- Focus: Error and urgent alerts

### Priority #2: Energy Data  
- Default: **Daily** intervals (24 hours)
- Metrics: **Energy + Power** (not irradiance by default)
- Portfolio support: Omit site_id for aggregation

### Priority #3: Performance
- Default: **Daily** aggregation
- All sites: Portfolio summary with per-site breakdown
- Health indicators: Color-coded (✅ ⚠️ 🔴)

---

## Data Flow Architecture

```
User Question (ChatGPT)
    ↓
MCP Server Routes to Tool
    ↓
Tool Validates Parameters
    ↓
AMPP API Client
    ↓
Bearer Token Auth (auto-refresh)
    ↓
AMMP API (https://data-api.ammp.io)
    ↓
Response Parsing & Formatting
    ↓
Structured Content + Text Summary
    ↓
Widget Metadata (for React rendering)
    ↓
ChatGPT Display (text + widget)
```

---

## Error Handling

All tools include comprehensive error handling:

✅ **Authentication Errors**
- "Not authenticated. Please authenticate with your AMMP API key first."
- Automatic re-authentication on 401 errors

✅ **API Errors**
- Network failures → Clear error messages
- Invalid parameters → Validation errors
- Rate limiting → Retry guidance
- Empty data → User-friendly "No data found" messages

✅ **User-Friendly Messages**
- Icons for visual feedback (✅ 🔴 ⚠️ 🔵)
- Sorted data (most important first)
- Sample previews (top 5-10 items)
- "View full data in widget" prompts

---

## What's Next: Phase 3 - Widget Components

Now that we have all the backend tools ready, we need to build the **React widget** to visualize the data:

### Components to Build:
1. **Authentication UI** - API key input form
2. **Energy Chart** - Interactive Recharts time series
3. **Alerts Table** - Sortable, filterable, color-coded
4. **Performance Dashboard** - Metric cards with health indicators
5. **Site Selector** - Choose site or "All Sites" (portfolio)
6. **Main Layout** - Tabs for different views

### Priorities:
1. Build basic React app structure
2. Energy chart with Recharts (Priority #2)
3. Alerts table (Priority #1)
4. Performance metrics display
5. Polish and interactivity

---

## Testing Checklist

Before moving to Phase 3, you can test Phase 2:

```bash
# Start dev server
npm run dev:local

# In another terminal
ngrok http 3000

# Add to ChatGPT with ngrok URL
# Test each tool:
```

✅ **Authentication**
```
"Authenticate with API key: [your-key]"
```

✅ **Sites**
```
"Show me all my AMMP sites"
```

✅ **Alerts** (Priority #1)
```
"Show me all error alerts"
"What are the active warnings for Site Alpha?"
"Show me resolved alerts from last week"
```

✅ **Energy** (Priority #2)
```
"What's today's energy production for Site Beta?"
"Show me hourly energy data for yesterday"
"Compare energy production across all sites this week"
```

✅ **Performance** (Priority #3)
```
"What's the availability of Site Gamma?"
"Show me portfolio performance for January"
"Which sites have the best performance ratio?"
```

✅ **Devices**
```
"List all devices at Site Delta"
"Are there any offline inverters?"
```

✅ **Weather**
```
"What was the weather at Site Epsilon yesterday?"
"Show me irradiance data for this week"
```

---

## Files Created in Phase 2

```
src/server/tools/
├── ammp-auth.ts        ✅ Authentication
├── ammp-sites.ts       ✅ Sites listing
├── ammp-alerts.ts      ✅ Alerts (Priority #1)
├── ammp-energy.ts      ✅ Energy data (Priority #2)
├── ammp-performance.ts ✅ Performance (Priority #3)
├── ammp-devices.ts     ✅ Devices/inverters
└── ammp-weather.ts     ✅ Weather data

src/server/
└── mcpServer.ts        ✅ Updated with all 7 tools
```

---

## Phase 2 Summary

✅ **7 MCP tools** covering all AMMP API endpoints
✅ **Smart defaults** aligned with priorities
✅ **Error handling** for all edge cases
✅ **Portfolio + site views** for all relevant tools
✅ **Rich formatting** with icons and summaries
✅ **Structured data** ready for widget rendering
✅ **Full MCP registration** with proper metadata

**Ready for Phase 3!** 🚀

The backend is complete. Now we build the interactive React widget to visualize this data beautifully with Recharts and interactive tables.
