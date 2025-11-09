import { TestDataParams, EdgeEvent } from '../interfaces.js';
import { generateTestEvent } from '../utils.js';

/**
 * MCP Tool: Generate Test Data
 * 
 * Generates test edge events for system validation and demonstration.
 * This tool is designed to be called via MCP protocol for test data creation.
 * 
 * @param params - Parameters for test data generation including count, bounds, and event types
 * @returns Promise resolving to generated events and count
 */
export async function testDataGenerator(params: TestDataParams): Promise<{ events: EdgeEvent[]; count: number }> {
  try {
    // Validate required parameters
    if (!params || typeof params.count !== 'number') {
      throw new Error('Invalid parameters: count is required and must be a number');
    }

    const { count, bounds, event_types } = params;

    // Validate count parameter
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      throw new Error('Invalid count: must be integer between 1 and 1000');
    }

    // Validate bounds if provided
    if (bounds) {
      const { north, south, east, west } = bounds;
      if (typeof north !== 'number' || typeof south !== 'number' || 
          typeof east !== 'number' || typeof west !== 'number') {
        throw new Error('Invalid bounds: all coordinates must be numbers');
      }
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

    // Validate event_types if provided
    if (event_types) {
      if (!Array.isArray(event_types) || event_types.length === 0) {
        throw new Error('Invalid event_types: must be non-empty array');
      }
      if (!event_types.every(type => typeof type === 'string' && type.trim() !== '')) {
        throw new Error('Invalid event_types: all types must be non-empty strings');
      }
    }

    // Generate the requested number of test events
    const events: EdgeEvent[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const event = generateTestEvent(bounds, event_types);
        events.push(event);
      } catch (error) {
        // If individual event generation fails, continue with others
        console.warn(`Failed to generate test event ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (events.length === 0) {
      throw new Error('Failed to generate any test events');
    }

    return {
      events,
      count: events.length
    };

  } catch (error) {
    // Handle any errors during generation
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Return empty result with error logged
    console.error(`Failed to generate test data: ${errorMessage}`);
    
    return {
      events: [],
      count: 0
    };
  }
}