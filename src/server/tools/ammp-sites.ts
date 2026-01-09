/**
 * AMMP Sites Tool
 * Lists all accessible sites/facilities
 */

import { z } from 'zod';
import { getAMPPClient } from '../ammp/client';

export const listSitesTool = {
  name: 'list_ammp_sites',
  description: 'List all AMMP sites/facilities accessible to the authenticated user. Shows site details including capacity and status.',
  inputSchema: {
    // No required inputs - just list all sites
  },
};

export async function listSitesHandler() {
  try {
    const client = getAMPPClient();
    
    // Check if authenticated
    if (!client.isAuthenticated()) {
      throw new Error('Not authenticated. Please authenticate with your AMMP API key first.');
    }
    
    const assets = await client.getSites();  // Returns Asset[]
    
    const structuredContent = {
      success: true,
      total_sites: assets.length,
      sites: assets.map(asset => ({
        id: asset.asset_id,
        name: asset.asset_name,
        long_name: asset.long_name,
        capacity_kw: asset.total_pv_power,
        location: {
          latitude: asset.latitude,
          longitude: asset.longitude,
          place: asset.place,
          region: asset.region,
          country: asset.country_code,
        },
      })),
    };

    // Create a formatted text summary
    const sitesList = sitesResponse.sites
      .map(site => {
        const capacity = site.capacity_kw ? `${site.capacity_kw} kW` : 'Unknown';
        const status = site.status ? `(${site.status})` : '';
        const location = site.location?.address ? ` - ${site.location.address}` : '';
        return `• ${site.name}: ${capacity} ${status}${location}`;
      })
      .join('\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${sitesResponse.sites.length} AMMP sites:\n\n${sitesList}`,
        },
      ],
      structuredContent,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sites';
    
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${errorMessage}`,
        },
      ],
      structuredContent: {
        success: false,
        error: errorMessage,
      },
      isError: true,
    };
  }
}
