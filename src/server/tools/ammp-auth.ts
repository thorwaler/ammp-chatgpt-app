/**
 * AMMP Authentication Tool
 * Handles API key authentication and returns available sites
 */

import { z } from 'zod';
import { getAMPPClient } from '../ammp/client';

export const authenticateAmmpTool = {
  name: 'authenticate_ammp',
  description: 'Authenticate with AMMP API using an API key. Returns authentication status and available sites.',
  inputSchema: {
    api_key: z.string().min(10).describe('AMMP API key provided by the user'),
  },
};

export async function authenticateAmmpHandler(args: { api_key: string }) {
  try {
    const client = getAMPPClient();
    
    // Authenticate and get token
    const tokenInfo = await client.authenticate(args.api_key);
    
    // Fetch available sites to confirm authentication works
    const sitesResponse = await client.getSites();
    
    // Prepare structured content for the model
    const structuredContent = {
      success: true,
      authenticated: true,
      token_expires_at: new Date(tokenInfo.expiresAt).toISOString(),
      sites_count: sitesResponse.total || sitesResponse.sites.length,
      sites: sitesResponse.sites.map(site => ({
        id: site.id,
        name: site.name,
        capacity_kw: site.capacity_kw,
        status: site.status,
      })),
    };

    // Prepare metadata (not visible to model) with full token info
    const metadata = {
      token_info: {
        token: tokenInfo.token,
        expires_at: tokenInfo.expiresAt,
      },
      full_sites_data: sitesResponse.sites,
    };

    return {
      content: [
        {
          type: 'text',
          text: `Successfully authenticated with AMMP API. Found ${sitesResponse.sites.length} accessible sites:\n\n${sitesResponse.sites.map(s => `• ${s.name} (${s.capacity_kw ? s.capacity_kw + ' kW' : 'Unknown capacity'})`).join('\n')}`,
        },
      ],
      structuredContent,
      _meta: metadata,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
    
    return {
      content: [
        {
          type: 'text',
          text: `Authentication failed: ${errorMessage}`,
        },
      ],
      structuredContent: {
        success: false,
        authenticated: false,
        error: errorMessage,
      },
      isError: true,
    };
  }
}
