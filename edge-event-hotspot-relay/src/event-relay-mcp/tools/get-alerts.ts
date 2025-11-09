import { GetAlertsParams, AlertRecord } from '../interfaces.js';
import { retrieveAlerts } from '../utils.js';

/**
 * MCP Tool: Get Alert Records
 * 
 * Retrieves alert records with optional temporal and severity filtering.
 * This tool is designed to be called via MCP protocol for alert data access.
 * 
 * @param params - Optional filters for time, severity, and result limit
 * @returns Promise resolving to array of alert records
 */
export async function getAlerts(params: GetAlertsParams): Promise<{ alerts: AlertRecord[] }> {
  try {
    // Extract optional parameters
    const { since, severity, limit } = params || {};

    // Validate since timestamp if provided
    if (since !== undefined && (!Number.isInteger(since) || since < 0)) {
      throw new Error('Invalid since parameter: must be non-negative integer timestamp');
    }

    // Validate severity if provided
    if (severity !== undefined && !['low', 'medium', 'high', 'critical'].includes(severity)) {
      throw new Error('Invalid severity: must be one of low, medium, high, critical');
    }

    // Validate limit if provided
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 1000)) {
      throw new Error('Invalid limit: must be integer between 1 and 1000');
    }

    // Retrieve alerts using the utility function
    const alerts = await retrieveAlerts(since, severity, limit);

    return { alerts };

  } catch (error) {
    // Handle any errors during retrieval
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Return empty result with error logged (in production, this would be logged via env.logger)
    console.error(`Failed to retrieve alerts: ${errorMessage}`);
    
    return { alerts: [] };
  }
}