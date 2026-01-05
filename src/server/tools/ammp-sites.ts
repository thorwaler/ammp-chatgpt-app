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
    
    const sitesResponse = await client.getSites();
    
    const structuredContent = {
      success: true,
      total_sites: sitesResponse.total || sitesResponse.sites.length,
      sites: sitesResponse.sites.map(site => ({
        id: site.id,
        name: site.name,
        capacity_kw: site.capacity_kw,
        status: site.status,
        location: site.location,
        commissioned_date: site.commissioned_date,
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
          type: 'text',
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
          type: 'text',
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
