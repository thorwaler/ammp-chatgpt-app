/**
 * AMMP API TypeScript Types
 * Based on https://data-api.ammp.io/docs (actual API)
 */

// Authentication
export interface AuthRequest {
  api_key: string;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export interface TokenInfo {
  token: string;
  expiresAt: number;
}

export interface AMPPClientConfig {
  baseURL?: string;
  apiKey?: string;
  bearerToken?: string;
}

// Asset Types (formerly "Site")
// Based on actual API response from https://data-api.ammp.io/docs
export interface Asset {
  asset_id: string;
  asset_name: string;
  long_name: string;
  latitude: number;
  longitude: number;
  total_pv_power: number;
  region: string;
  place: string;
  country_code: string;
  beta: number;
  tref: number;
  tags: Record<string, any>;
  asset_specific_params: Record<string, any>;
  co2_offset_factor: number;
  modeled_loss: number;
  expected_pr: number;
  warnings: string[];
  org_id: string;
  asset_timezone?: string;
  created?: string;
  grid_type?: 'grid-tied' | 'off-grid' | 'hybrid';
}

// For backward compatibility with existing code
export interface AssetsResponse {
  assets?: Asset[];
  total?: number;
  // Or it might return the array directly
  [key: number]: Asset;
  length?: number;
}

// Alias for backward compatibility
export type SitesResponse = Asset[];
export type Site = Asset;

// Energy Data Types
export interface EnergyDataPoint {
  timestamp: string;
  energy_kwh?: number;
  power_kw?: number;
  irradiance_w_m2?: number;
}

export interface EnergyDataRequest {
  asset_id?: string; // Changed from site_id
  site_id?: string; // @deprecated - for backward compatibility, use asset_id
  start_date: string;
  end_date: string;
  interval?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
}

export interface EnergyDataResponse {
  data: EnergyDataPoint[];
  total_energy_kwh?: number;
  asset_id?: string;
}

// Alerts / Tickets Types
export interface Alert {
  id: string;
  asset_id: string;
  asset_name?: string;
  title: string;
  description?: string;
  severity: 'error' | 'warning' | 'info';
  status: 'active' | 'resolved' | 'acknowledged';
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
}

export interface AlertsRequest {
  asset_id?: string; // Changed from site_id
  site_id?: string; // @deprecated - for backward compatibility, use asset_id
  asset_ids?: string[]; // For multiple assets
  start_date?: string;
  end_date?: string;
  severity?: ('error' | 'warning' | 'info')[];
  status?: ('active' | 'resolved' | 'acknowledged')[];
  limit?: number;
  offset?: number;
}

export interface AlertsResponse {
  tickets: Alert[]; // Note: API calls them "tickets"
  total: number;
  has_more?: boolean;
}

// Performance / KPI Types
export interface PerformanceMetrics {
  performance_ratio?: number;
  availability?: number;
  capacity_factor?: number;
  specific_yield?: number;
  timestamp?: string;
}

export interface PerformanceRequest {
  asset_id?: string; // Changed from site_id
  site_id?: string; // @deprecated - for backward compatibility, use asset_id
  start_date: string;
  end_date: string;
  aggregation?: 'daily' | 'monthly' | 'total';
}

export interface PerformanceResponse {
  data: PerformanceMetrics[];
  averages?: PerformanceMetrics;
  asset_id?: string;
}

// Device Types
export interface Device {
  device_id: string;
  device_name: string;
  serial_no?: string;
  device_type?: 'pv-inverter' | 'battery-system' | 'meter' | 'genset' | 'sensor';
  manufacturer?: string;
  model?: string;
  status?: 'online' | 'offline' | 'error';
  last_communication?: string;
}

export interface DevicesResponse {
  asset_id: string;
  asset_name: string;
  long_name: string;
  latitude: number;
  longitude: number;
  total_pv_power: number;
  region: string;
  place: string;
  country_code: string;
  beta: number;
  tref: number;
  tags: Record<string, any>;
  asset_specific_params: Record<string, any>;
  co2_offset_factor: number;
  modeled_loss: number;
  expected_pr: number;
  warnings: string[];
  devices: Device[];
}

// Weather / Environment Types
export interface WeatherDataPoint {
  timestamp: string;
  temperature_c?: number;
  irradiance_w_m2?: number;
  wind_speed_m_s?: number;
  humidity_percent?: number;
  precipitation_mm?: number;
}

export interface WeatherDataResponse {
  data: WeatherDataPoint[];
  asset_id?: string;
}

// Status Types
export interface StatusInfo {
  level: 'ok' | 'warning' | 'error';
  message: string;
  timestamp: string;
  asset_id: string;
}

export interface StatusInfoResponse {
  status: StatusInfo;
  asset_id: string;
}

// Asset Group Types
export interface AssetGroup {
  id: string;
  name: string;
  description?: string;
  asset_count?: number;
}

export interface AssetGroupsResponse {
  groups: AssetGroup[];
  total: number;
}

export interface AssetGroupMembersResponse {
  assets: Asset[];
  group_id: string;
  total: number;
}

// Error Response
export interface ErrorResponse {
  error: string;
  message: string;
  status_code?: number;
  details?: any;
}

// Utility Types
export type Interval = 'hour' | 'day' | 'week' | 'month';
export type Severity = 'error' | 'warning' | 'info';
export type AlertSeverity = Severity; // Alias for backward compatibility
export type AlertStatus = 'active' | 'resolved' | 'acknowledged';
export type DeviceType = 'inverter' | 'meter' | 'battery' | 'genset' | 'sensor';
