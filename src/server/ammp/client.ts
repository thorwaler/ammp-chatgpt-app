/**
 * AMMP API Client
 * Handles authentication, token management, and API requests
 */

import type {
  AuthResponse,
  TokenInfo,
  AMPPClientConfig,
  SitesResponse,
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
      // If a bearer token is provided, store it with a far future expiry
      // (will be updated when we get actual expiry from API)
      this.tokenInfo = {
        token: config.bearerToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours default
      };
    }
  }

  /**
   * Set API key and clear existing token
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.tokenInfo = undefined;
  }

  /**
   * Get current bearer token, refreshing if necessary
   */
  private async getBearerToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.tokenInfo && Date.now() < this.tokenInfo.expiresAt - 60000) {
      return this.tokenInfo.token;
    }

    // Otherwise, authenticate to get a new token
    if (!this.apiKey) {
      throw new Error('No API key configured. Please authenticate first.');
    }

    const authResponse = await this.authenticate(this.apiKey);
    return authResponse.token;
  }

  /**
   * Authenticate with API key and get bearer token
   */
  async authenticate(apiKey: string): Promise<TokenInfo> {
    try {
      const response = await fetch(`${this.baseURL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: apiKey }),
      });

      if (!response.ok) {
        const error: ErrorResponse = await response.json().catch(() => ({
          error: 'Authentication failed',
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.message || 'Authentication failed');
      }

      const data: AuthResponse = await response.json();
      
      // Calculate token expiry (use expires_in from API, or default to 1 hour)
      const expiresIn = data.expires_in || 3600;
      const expiresAt = Date.now() + expiresIn * 1000;

      this.tokenInfo = {
        token: data.access_token,
        expiresAt,
      };

      this.apiKey = apiKey;

      return this.tokenInfo;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to authenticate with AMMP API');
    }
  }

  /**
   * Make an authenticated API request
   */
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
      
      // If unauthorized, clear token and throw
      if (response.status === 401) {
        this.tokenInfo = undefined;
        throw new Error('Authentication expired. Please re-authenticate.');
      }
      
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all sites/facilities
   */
  async getSites(): Promise<SitesResponse> {
    return this.request<SitesResponse>('/sites');
  }

  /**
   * Get site details by ID
   */
  async getSiteDetails(siteId: string): Promise<any> {
    return this.request(`/sites/${siteId}`);
  }

  /**
   * Get energy data for a site or portfolio
   */
  async getEnergyData(request: EnergyDataRequest): Promise<EnergyDataResponse> {
    const params = new URLSearchParams();
    params.append('start_date', request.start_date);
    params.append('end_date', request.end_date);
    
    if (request.interval) {
      params.append('interval', request.interval);
    }
    
    if (request.metrics) {
      params.append('metrics', request.metrics.join(','));
    }

    const endpoint = request.site_id
      ? `/sites/${request.site_id}/energy?${params}`
      : `/portfolio/energy?${params}`;

    return this.request<EnergyDataResponse>(endpoint);
  }

  /**
   * Get alerts for a site or all sites
   */
  async getAlerts(request: AlertsRequest = {}): Promise<AlertsResponse> {
    const params = new URLSearchParams();
    
    if (request.start_date) params.append('start_date', request.start_date);
    if (request.end_date) params.append('end_date', request.end_date);
    if (request.severity) params.append('severity', request.severity.join(','));
    if (request.status) params.append('status', request.status.join(','));
    if (request.limit) params.append('limit', String(request.limit));
    if (request.offset) params.append('offset', String(request.offset));

    const endpoint = request.site_id
      ? `/sites/${request.site_id}/alerts?${params}`
      : `/alerts?${params}`;

    return this.request<AlertsResponse>(endpoint);
  }

  /**
   * Get performance metrics for a site or portfolio
   */
  async getPerformance(request: PerformanceRequest): Promise<PerformanceResponse> {
    const params = new URLSearchParams();
    params.append('start_date', request.start_date);
    params.append('end_date', request.end_date);
    
    if (request.aggregation) {
      params.append('aggregation', request.aggregation);
    }

    const endpoint = request.site_id
      ? `/sites/${request.site_id}/performance?${params}`
      : `/portfolio/performance?${params}`;

    return this.request<PerformanceResponse>(endpoint);
  }

  /**
   * Get devices/inverters for a site
   */
  async getDevices(siteId: string): Promise<DevicesResponse> {
    return this.request<DevicesResponse>(`/sites/${siteId}/devices`);
  }

  /**
   * Get weather data for a site
   */
  async getWeatherData(
    siteId: string,
    startDate: string,
    endDate: string
  ): Promise<WeatherDataResponse> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);

    return this.request<WeatherDataResponse>(
      `/sites/${siteId}/weather?${params}`
    );
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.tokenInfo && Date.now() < this.tokenInfo.expiresAt;
  }

  /**
   * Get current token info (for storage)
   */
  getTokenInfo(): TokenInfo | undefined {
    return this.tokenInfo;
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.apiKey = undefined;
    this.tokenInfo = undefined;
  }
}

/**
 * Create a singleton instance for use across tools
 */
let clientInstance: AMPPAPIClient | undefined;

export function getAMPPClient(config?: AMPPClientConfig): AMPPAPIClient {
  if (!clientInstance) {
    clientInstance = new AMPPAPIClient(config);
  } else if (config) {
    // Update existing client with new config
    if (config.apiKey) {
      clientInstance.setApiKey(config.apiKey);
    }
  }
  return clientInstance;
}

export function clearAMPPClient(): void {
  if (clientInstance) {
    clientInstance.clearAuth();
  }
  clientInstance = undefined;
}
