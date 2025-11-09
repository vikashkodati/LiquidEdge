import { IngestEventParams } from '../interfaces.js';
import { validateEdgeEvent, storeEdgeEvent } from '../utils.js';

/**
 * MCP Tool: Ingest Edge Event
 * 
 * Validates and stores an edge detection event in the system.
 * This tool is designed to be called via MCP protocol for event ingestion.
 * 
 * @param params - Object containing the edge event to ingest
 * @returns Promise resolving to success status and message
 */
export async function ingestEvent(params: IngestEventParams): Promise<{ success: boolean; message: string }> {
  try {
    // Validate input parameters
    if (!params || !params.event) {
      return {
        success: false,
        message: 'Invalid parameters: event object is required'
      };
    }

    const { event } = params;

    // Validate the event structure and data
    if (!validateEdgeEvent(event)) {
      return {
        success: false,
        message: 'Invalid edge event: validation failed'
      };
    }

    // Store the event in the system
    await storeEdgeEvent(event);

    return {
      success: true,
      message: `Edge event '${event.id}' ingested successfully`
    };

  } catch (error) {
    // Handle any errors during ingestion
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      message: `Failed to ingest event: ${errorMessage}`
    };
  }
}