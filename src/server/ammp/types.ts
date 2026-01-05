/**
 * AMMP API TypeScript Types
 * Based on https://data-api.ammp.io/docs
 */

// Authentication
export interface AuthRequest {
  api_key: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Site/Facility Types
export interface Site {
  id: string;
  name: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  capacity_kw?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  timezone?: string;
  commissioned_date?: string;
}

export interface SitesResponse {
  sites: Site[];
  total: number;
}

// Energy Data Types
export interface EnergyDataPoint {
  timestamp: string;
  energy_kwh?: number;
  power_kw?: number;
  irradiance_w_m2?: number;
}

export interface EnergyDataRequest {
  site_id?: string; // Optional - if omitted, returns portfolio data
  start_date: string; // ISO 8601 format
  end_date: string;
  interval?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[]; // e.g., ['energy', 'power', 'irradiance']
}

export interface EnergyDataResponse {
  site_id?: string;
  site_name?: string;
  data: EnergyDataPoint[];
  units: {
    energy?: string;
    power?: string;
    irradiance?: string;
  };
  interval: string;
}

// Alert Types
export type AlertSeverity = 'error' | 'warning' | 'info';
export type AlertStatus = 'active' | 'resolved' | 'acknowledged';

export interface Alert {
  id: string;
  site_id: string;
  site_name?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  timestamp: string;
  resolved_at?: string;
  category?: string;
  device_id?: string;
  metadata?: Record<string, unknown>;
}

export interface AlertsRequest {
  site_id?: string; // Optional - if omitted, returns all sites
  start_date?: string;
  end_date?: string;
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  limit?: number;
  offset?: number;
}

export interface AlertsResponse {
  alerts: Alert[];
  total: number;
  has_more: boolean;
}

// Performance Metrics Types
export interface PerformanceMetrics {
  site_id: string;
  site_name?: string;
  period: {
    start: string;
    end: string;
  };
  availability_percent?: number;
  capacity_factor_percent?: number;
  performance_ratio_percent?: number;
  total_energy_kwh?: number;
  expected_energy_kwh?: number;
  downtime_hours?: number;
  specific_yield_kwh_kwp?: number;
}

export interface PerformanceRequest {
  site_id?: string; // Optional - if omitted, returns portfolio
  start_date: string;
  end_date: string;
  aggregation?: 'daily' | 'weekly' | 'monthly';
}

export interface PerformanceResponse {
  metrics: PerformanceMetrics[];
  portfolio_summary?: {
    total_energy_kwh: number;
    average_availability_percent: number;
    average_performance_ratio_percent: number;
    total_capacity_kw: number;
  };
}

// Device/Inverter Types
export interface Device {
  id: string;
  site_id: string;
  name: string;
  type: 'inverter' | 'meter' | 'sensor' | 'tracker' | 'other';
  manufacturer?: string;
  model?: string;
  capacity_kw?: number;
  status: 'online' | 'offline' | 'fault';
  last_communication?: string;
}

export interface DevicesResponse {
  devices: Device[];
  total: number;
}

// Weather Data Types
export interface WeatherData {
  timestamp: string;
  temperature_c?: number;
  irradiance_w_m2?: number;
  wind_speed_m_s?: number;
  humidity_percent?: number;
  precipitation_mm?: number;
}

export interface WeatherDataResponse {
  site_id: string;
  data: WeatherData[];
}

// Error Response
export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  status_code?: number;
}

// API Client Types
export interface AMPPClientConfig {
  apiKey?: string;
  bearerToken?: string;
  baseURL?: string;
}

export interface TokenInfo {
  token: string;
  expiresAt: number; // Unix timestamp
}
