import { GetHotspotsParams, HotspotData } from '../interfaces.js';
import { retrieveHotspots } from '../utils.js';

/**
 * MCP Tool: Get Hotspot Data
 * 
 * Retrieves aggregated hotspot data with optional geographic and statistical filtering.
 * This tool is designed to be called via MCP protocol for hotspot data access.
 * 
 * @param params - Optional filters for bounds, precision, and minimum count
 * @returns Promise resolving to array of hotspot data
 */
export async function getHotspots(params: GetHotspotsParams): Promise<{ hotspots: HotspotData[] }> {
  try {
    // Extract optional parameters with defaults
    const { bounds, precision, min_count } = params || {};

    // Validate bounds if provided
    if (bounds) {
      const { north, south, east, west } = bounds;
      if (north < south || east < west) {
        throw new Error('Invalid bounds: north must be >= south, east must be >= west');
      }
      if (north < -90 || north > 90 || south < -90 || south > 90) {
        throw new Error('Invalid bounds: latitude must be between -90 and 90');
      }
      if (east < -180 || east > 180 || west < -180 || west > 180) {
        throw new Error('Invalid bounds: longitude must be between -180 and 180');
      }
    }

    // Validate precision if provided
    if (precision !== undefined && (!Number.isInteger(precision) || precision < 1 || precision > 12)) {
      throw new Error('Invalid precision: must be integer between 1 and 12');
    }

    // Validate min_count if provided
    if (min_count !== undefined && (!Number.isInteger(min_count) || min_count < 1)) {
      throw new Error('Invalid min_count: must be positive integer');
    }

    // Retrieve hotspots using the utility function
    const hotspots = await retrieveHotspots(bounds, precision, min_count);

    return { hotspots };

  } catch (error) {
    // Handle any errors during retrieval
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Return empty result with error logged (in production, this would be logged via env.logger)
    console.error(`Failed to retrieve hotspots: ${errorMessage}`);
    
    return { hotspots: [] };
  }
}