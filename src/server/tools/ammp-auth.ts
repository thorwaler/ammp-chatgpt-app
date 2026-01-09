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
    
    // Fetch available assets to confirm authentication works
    const assets = await client.getAssets();
    
    // Prepare structured content for the model
    const structuredContent = {
      success: true,
      authenticated: true,
      token_expires_at: new Date(tokenInfo.expiresAt).toISOString(),
      assets_count: assets.length,
      assets: assets.map(asset => ({
        id: asset.asset_id,
        name: asset.asset_name,
        capacity_kw: asset.total_pv_power,
        location: `${asset.place}, ${asset.country_code}`,
      })),
    };

    // Prepare metadata (not visible to model) with full token info
    const metadata = {
      token_info: {
        token: tokenInfo.token,
        expires_at: tokenInfo.expiresAt,
      },
      full_assets_data: assets,
    };

    return {
      content: [
        {
          type: 'text' as const,
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
          type: 'text' as const,
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
