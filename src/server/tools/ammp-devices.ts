/**
 * AMMP Devices Tool
 * Fetches device/inverter information for a site
 */

import { z } from 'zod';
import { getAMPPClient } from '../ammp/client.js';

export const getDevicesTool = {
  name: 'get_ammp_devices',
  description: 'Get device and inverter information for an AMMP site. Shows equipment details, status, and last communication times.',
  inputSchema: {
    site_id: z.string().describe('Site ID to fetch devices for'),
  },
};

export async function getDevicesHandler(args: { site_id: string }) {
  try {
    const client = getAMPPClient();
    
    if (!client.isAuthenticated()) {
      throw new Error('Not authenticated. Please authenticate with your AMMP API key first.');
    }

    const devicesResponse = await client.getDevices(args.site_id);

    // Count devices by type and status
    const typeCounts: Record<string, number> = {};
    const statusCounts = {
      online: 0,
      offline: 0,
      fault: 0,
    };

    devicesResponse.devices.forEach(device => {
      typeCounts[device.type] = (typeCounts[device.type] || 0) + 1;
      statusCounts[device.status]++;
    });

    const structuredContent = {
      success: true,
      site_id: args.site_id,
      total_devices: devicesResponse.total || devicesResponse.devices.length,
      type_counts: typeCounts,
      status_counts: statusCounts,
      devices: devicesResponse.devices.map(device => ({
        id: device.id,
        name: device.name,
        type: device.type,
        manufacturer: device.manufacturer,
        model: device.model,
        capacity_kw: device.capacity_kw,
        status: device.status,
        last_communication: device.last_communication,
      })),
    };

    // Create formatted text summary
    let summary = `🔧 Devices for site ${args.site_id}\n\n`;
    summary += `Total Devices: ${devicesResponse.devices.length}\n\n`;
    
    summary += `Status Breakdown:\n`;
    summary += `• ${statusCounts.online > 0 ? '✅' : '⚪'} Online: ${statusCounts.online}\n`;
    summary += `• ${statusCounts.offline > 0 ? '🔴' : '⚪'} Offline: ${statusCounts.offline}\n`;
    summary += `• ${statusCounts.fault > 0 ? '⚠️' : '⚪'} Fault: ${statusCounts.fault}\n\n`;

    summary += `Device Types:\n`;
    Object.entries(typeCounts).forEach(([type, count]) => {
      summary += `• ${type}: ${count}\n`;
    });
    summary += '\n';

    if (devicesResponse.devices.length > 0) {
      summary += `Device Details:\n\n`;
      devicesResponse.devices.forEach((device, idx) => {
        const statusIcon = device.status === 'online' ? '✅' : device.status === 'fault' ? '⚠️' : '🔴';
        summary += `${idx + 1}. ${statusIcon} ${device.name}\n`;
        summary += `   Type: ${device.type}\n`;
        if (device.manufacturer || device.model) {
          summary += `   Model: ${device.manufacturer || ''} ${device.model || ''}`.trim() + '\n';
        }
        if (device.capacity_kw) {
          summary += `   Capacity: ${device.capacity_kw} kW\n`;
        }
        summary += `   Status: ${device.status}\n`;
        if (device.last_communication) {
          const lastComm = new Date(device.last_communication).toLocaleString();
          summary += `   Last Communication: ${lastComm}\n`;
        }
        summary += '\n';
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
      structuredContent,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch devices';
    
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching devices: ${errorMessage}`,
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
