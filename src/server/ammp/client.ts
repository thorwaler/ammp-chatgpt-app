/**
 * AMMP API Client - Updated for Actual API Structure
 * Based on https://data-api.ammp.io/docs
 */

import type {
  AuthResponse,
  TokenInfo,
  AMPPClientConfig,
  AssetsResponse,
  Asset,
  EnergyDataRequest,
  EnergyDataResponse,
  AlertsRequest,
  AlertsResponse,
  PerformanceRequest,
  PerformanceResponse,
  DevicesResponse,
  WeatherDataResponse,
  ErrorResponse,
} from './types';

export class AMPPAPIClient {
  private baseURL: string;
  private apiKey?: string;
  private tokenInfo?: TokenInfo;

  constructor(config: AMPPClientConfig = {}) {
    this.baseURL = config.baseURL || 'https://data-api.ammp.io';
    this.apiKey = config.apiKey;
    
    if (config.bearerToken) {
      this.tokenInfo = {
        token: config.bearerToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
    }
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.tokenInfo = undefined;
  }

  isAuthenticated(): boolean {
    return !!this.tokenInfo || !!this.apiKey;
  }

  private async getBearerToken(): Promise<string> {
    const bufferMs = 5 * 60 * 1000;
    if (this.tokenInfo && Date.now() < this.tokenInfo.expiresAt - bufferMs) {
      return this.tokenInfo.token;
    }

    if (!this.apiKey) {
      throw new Error('No API key configured. Please authenticate first.');
    }

    const authResponse = await this.authenticate(this.apiKey);
    return authResponse.token;
  }

  private parseJwtExpiration(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch (error) {
      return 0;
    }
  }

  async authenticate(apiKey: string): Promise<TokenInfo> {
    try {
      console.log('[AMMP Auth] Authenticating with API key');
      
      const response = await fetch(`${this.baseURL}/v1/token`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'x-api-key': apiKey,
        },
      });

      console.log('[AMMP Auth] Response status:', response.status);

      if (!response.ok) {
        let errorDetails = '';
        try {
          errorDetails = await response.text();
          console.log('[AMMP Auth] Error response:', errorDetails);
        } catch (e) {
          // Ignore
        }

        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your AMMP API key and try again.');
        } else if (response.status === 403) {
          throw new Error('API key does not have permission to access AMMP API.');
        } else if (response.status === 404) {
          throw new Error(`Authentication endpoint not found (404). Details: ${errorDetails}`);
        }
        
        throw new Error(`Authentication failed (${response.status}): ${response.statusText}`);
      }

      const data: AuthResponse = await response.json();
      console.log('[AMMP Auth] Successfully received token');
      
      let expiresAt: number;
      if (data.expires_in) {
        expiresAt = Date.now() + data.expires_in * 1000;
      } else {
        expiresAt = this.parseJwtExpiration(data.access_token);
        if (expiresAt === 0) {
          expiresAt = Date.now() + 3600 * 1000;
        }
      }

      this.tokenInfo = {
        token: data.access_token,
        expiresAt,
      };

      this.apiKey = apiKey;

      return this.tokenInfo;
    } catch (error) {
      console.error('[AMMP Auth] Authentication error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to authenticate with AMMP API');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getBearerToken();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json().catch(() => ({
        error: 'API request failed',
        message: `HTTP ${response.status}: ${response.statusText}`,
        status_code: response.status,
      }));
      
      if (response.status === 401) {
        this.tokenInfo = undefined;
        throw new Error('Authentication expired. Please re-authenticate.');
      }
      
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  // ========== METADATA ENDPOINTS ==========

  /**
   * Get all assets (formerly "sites")
   * API returns array directly: Asset[]
   */
  async getAssets(): Promise<Asset[]> {
    return this.request<Asset[]>('/v1/assets');
  }

  /**
   * Get asset details by ID
   */
  async getAssetDetails(assetId: string): Promise<Asset> {
    return this.request<Asset>(`/v1/assets/${assetId}`);
  }

  /**
   * Get devices for an asset
   */
  async getAssetDevices(assetId: string): Promise<DevicesResponse> {
    const response = await this.request<any>(`/v1/assets/${assetId}/devices`);
    
    // Map devices to include backward compatibility aliases
    const devices = (response.devices || []).map((device: any) => ({
      ...device,
      id: device.device_id,
      name: device.device_name,
      type: device.device_type,
    }));
    
    return {
      ...response,
      devices,
      total: devices.length, // Add total for backward compatibility
    };
  }

  // ========== ASSET DATA ENDPOINTS ==========

  /**
   * Get most recent power data for an asset
   */
  async getMostRecentData(assetId: string): Promise<any> {
    return this.request(`/v1/assets/${assetId}/most-recent`);
  }

  /**
   * Get historic energy data for an asset
   */
  async getHistoricEnergy(request: EnergyDataRequest): Promise<EnergyDataResponse> {
    if (!request.asset_id) {
      throw new Error('asset_id is required for energy data');
    }

    const params = new URLSearchParams();
    params.append('start_date', request.start_date);
    params.append('end_date', request.end_date);
    
    if (request.interval) {
      params.append('interval', request.interval);
    }

    return this.request<EnergyDataResponse>(
      `/v1/assets/${request.asset_id}/historic-energy?${params}`
    );
  }

  /**
   * Get historic power data for an asset
   */
  async getHistoricPower(assetId: string, startDate: string, endDate: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);

    return this.request(`/v1/assets/${assetId}/historic-power?${params}`);
  }

  /**
   * Get historic environment data (weather) for an asset
   */
  async getHistoricEnvironment(assetId: string, startDate: string, endDate: string): Promise<WeatherDataResponse> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);

    return this.request<WeatherDataResponse>(
      `/v1/assets/${assetId}/historic-environment-data?${params}`
    );
  }

  // ========== TECHNICAL KPIs ENDPOINTS ==========

  /**
   * Get PV performance metrics (Performance Ratio, etc.)
   */
  async getTechnicalKpiPerformance(request: PerformanceRequest): Promise<PerformanceResponse> {
    if (!request.asset_id) {
      throw new Error('asset_id is required for performance data');
    }

    const params = new URLSearchParams();
    params.append('start_date', request.start_date);
    params.append('end_date', request.end_date);

    return this.request<PerformanceResponse>(
      `/v1/assets/${request.asset_id}/technical-kpis/pv-performance?${params}`
    );
  }

  // ========== STATUS ENDPOINTS ==========

  /**
   * Get last data received timestamp for an asset
   */
  async getLastDataReceived(assetId: string): Promise<any> {
    return this.request(`/v1/assets/${assetId}/last-data-received`);
  }

  /**
   * Get latest status info for an asset
   */
  async getStatusInfoLatest(assetId: string): Promise<any> {
    return this.request(`/v1/assets/${assetId}/status-info-latest`);
  }

  /**
   * Get status info log for an asset
   */
  async getStatusInfoLog(assetId: string, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/v1/assets/${assetId}/status-info-log?${queryString}`
      : `/v1/assets/${assetId}/status-info-log`;

    return this.request(endpoint);
  }

  // ========== TICKETING ENDPOINTS (Alerts) ==========

  /**
   * Get tickets (alerts) - POST method with filters
   */
  async getTickets(request: AlertsRequest = {}): Promise<AlertsResponse> {
    const body: any = {};
    
    if (request.asset_id) {
      body.asset_ids = [request.asset_id];
    }
    
    if (request.start_date) body.start_date = request.start_date;
    if (request.end_date) body.end_date = request.end_date;
    if (request.severity) body.severity = request.severity;
    if (request.status) body.status = request.status;
    if (request.limit) body.limit = request.limit;
    if (request.offset) body.offset = request.offset;

    const response = await this.request<any>('/v1/tickets/list', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Map API tickets to Alert format with backward compatibility aliases
    const tickets = (response.tickets || []).map((ticket: any) => ({
      ...ticket,
      // Backward compatibility aliases
      site_id: ticket.asset_id,
      site_name: ticket.asset_name,
      message: ticket.description,
      timestamp: ticket.created_at,
    }));

    return {
      tickets,
      alerts: tickets, // Alias for backward compatibility
      total: response.total || 0,
      has_more: response.has_more,
    };
  }

  // ========== ACCESS CONTROL ENDPOINTS ==========

  /**
   * Get asset groups (for portfolio view)
   */
  async getAssetGroups(): Promise<any> {
    return this.request('/v1/asset_groups');
  }

  /**
   * Get members of an asset group
   */
  async getAssetGroupMembers(groupId: string): Promise<any> {
    return this.request(`/v1/asset_groups/${groupId}/members`);
  }

  // ========== LEGACY METHOD ALIASES ==========
  // For backward compatibility with existing tool handlers

  /**
   * @deprecated Use getAssets() instead
   */
  async getSites(): Promise<Asset[]> {
    return this.getAssets();
  }

  /**
   * @deprecated Use getHistoricEnergy() instead
   */
  async getEnergyData(request: EnergyDataRequest): Promise<EnergyDataResponse> {
    // Map site_id to asset_id for backward compatibility
    const mappedRequest = {
      ...request,
      asset_id: request.asset_id || (request as any).site_id,
    };
    return this.getHistoricEnergy(mappedRequest);
  }

  /**
   * @deprecated Use getTickets() instead
   */
  async getAlerts(request: AlertsRequest = {}): Promise<AlertsResponse> {
    // Map site_id to asset_id for backward compatibility
    const mappedRequest = {
      ...request,
      asset_id: request.asset_id || (request as any).site_id,
    };
    return this.getTickets(mappedRequest);
  }

  /**
   * @deprecated Use getTechnicalKpiPerformance() instead
   */
  async getPerformance(request: PerformanceRequest): Promise<PerformanceResponse> {
    // Map site_id to asset_id for backward compatibility
    const mappedRequest = {
      ...request,
      asset_id: request.asset_id || (request as any).site_id,
    };
    return this.getTechnicalKpiPerformance(mappedRequest);
  }

  /**
   * @deprecated Use getAssetDevices() instead
   */
  async getDevices(assetId: string): Promise<DevicesResponse> {
    return this.getAssetDevices(assetId);
  }

  /**
   * @deprecated Use getHistoricEnvironment() instead
   */
  async getWeatherData(
    assetId: string,
    startDate: string,
    endDate: string
  ): Promise<WeatherDataResponse> {
    return this.getHistoricEnvironment(assetId, startDate, endDate);
  }
}

// Singleton instance
let clientInstance: AMPPAPIClient | null = null;

export function getAMPPClient(config?: AMPPClientConfig): AMPPAPIClient {
  if (!clientInstance) {
    clientInstance = new AMPPAPIClient(config);
  }
  return clientInstance;
}

export function resetAMPPClient(): void {
  clientInstance = null;
}
