import { ActorState } from "@liquidmetal-ai/raindrop-framework";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Env } from './raindrop.gen.js';
import { 
  EdgeEvent, 
  IngestEventParams, 
  GetHotspotsParams, 
  GetAlertsParams, 
  TestDataParams 
} from './interfaces.js';
import { 
  validateEdgeEvent, 
  storeEdgeEvent, 
  retrieveHotspots, 
  retrieveAlerts, 
  generateTestEvent 
} from './utils.js';

export const implementation = {
  name: "event-relay-mcp",
  version: "1.0.0",
};

/**
 * Event Relay MCP Service
 * 
 * Provides MCP tools for ingesting edge events, retrieving hotspot data,
 * getting alerts, and generating test data for the edge event system.
 */
export default (server: McpServer, env: Env, state: ActorState) => {
  
  // Tool: Ingest Edge Event
  server.registerTool(
    "ingest-event",
    {
      title: "Ingest Edge Event",
      description: "Ingest a new edge detection event into the system",
      inputSchema: {
        event: z.object({
          id: z.string().min(1, "Event ID is required"),
          timestamp: z.number().positive("Timestamp must be positive"),
          location: z.object({
            latitude: z.number().min(-90).max(90),
            longitude: z.number().min(-180).max(180)
          }),
          event_type: z.string().min(1, "Event type is required"),
          metadata: z.record(z.unknown()).optional()
        })
      },
    },
    async ({ event }: IngestEventParams) => {
      try {
        // Validate the event
        if (!validateEdgeEvent(event)) {
          throw new Error('Invalid edge event format');
        }

        // Store the event
        await storeEdgeEvent(event);
        
        env.logger.info('Edge event ingested successfully', { 
          eventId: event.id, 
          eventType: event.event_type 
        });
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              success: true, 
              message: `Event ${event.id} ingested successfully`,
              eventId: event.id
            }) 
          }] 
        };
      } catch (error) {
        env.logger.error('Failed to ingest edge event', { 
          error: error instanceof Error ? error.message : String(error),
          eventId: event?.id 
        });
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              success: false, 
              message: error instanceof Error ? error.message : 'Unknown error occurred'
            }) 
          }] 
        };
      }
    }
  );

  // Tool: Get Hotspots
  server.registerTool(
    "get-hotspots",
    {
      title: "Get Hotspot Data",
      description: "Retrieve aggregated hotspot data with optional filtering",
      inputSchema: {
        bounds: z.object({
          north: z.number().min(-90).max(90),
          south: z.number().min(-90).max(90),
          east: z.number().min(-180).max(180),
          west: z.number().min(-180).max(180)
        }).optional(),
        precision: z.number().int().min(1).max(12).optional(),
        min_count: z.number().int().min(1).optional()
      },
    },
    async (params: GetHotspotsParams) => {
      try {
        const hotspots = await retrieveHotspots(
          params.bounds, 
          params.precision, 
          params.min_count
        );
        
        env.logger.info('Hotspots retrieved successfully', { 
          count: hotspots.length,
          bounds: params.bounds,
          precision: params.precision
        });
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              hotspots,
              count: hotspots.length 
            }) 
          }] 
        };
      } catch (error) {
        env.logger.error('Failed to retrieve hotspots', { 
          error: error instanceof Error ? error.message : String(error),
          params 
        });
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              hotspots: []
            }) 
          }] 
        };
      }
    }
  );

  // Tool: Get Alerts
  server.registerTool(
    "get-alerts",
    {
      title: "Get Alert Records",
      description: "Retrieve alert records with optional filtering",
      inputSchema: {
        since: z.number().int().positive().optional(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        limit: z.number().int().min(1).max(1000).optional()
      },
    },
    async (params: GetAlertsParams) => {
      try {
        const alerts = await retrieveAlerts(
          params.since, 
          params.severity, 
          params.limit
        );
        
        env.logger.info('Alerts retrieved successfully', { 
          count: alerts.length,
          since: params.since,
          severity: params.severity
        });
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              alerts,
              count: alerts.length 
            }) 
          }] 
        };
      } catch (error) {
        env.logger.error('Failed to retrieve alerts', { 
          error: error instanceof Error ? error.message : String(error),
          params 
        });
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              alerts: []
            }) 
          }] 
        };
      }
    }
  );

  // Tool: Generate Test Data
  server.registerTool(
    "generate-test-data",
    {
      title: "Generate Test Data",
      description: "Generate test edge events for system validation",
      inputSchema: {
        count: z.number().int().min(1).max(1000),
        bounds: z.object({
          north: z.number().min(-90).max(90),
          south: z.number().min(-90).max(90),
          east: z.number().min(-180).max(180),
          west: z.number().min(-180).max(180)
        }).optional(),
        event_types: z.array(z.string()).optional()
      },
    },
    async (params: TestDataParams) => {
      try {
        const events: EdgeEvent[] = [];
        
        for (let i = 0; i < params.count; i++) {
          const event = generateTestEvent(params.bounds, params.event_types);
          events.push(event);
        }
        
        env.logger.info('Test data generated successfully', { 
          count: events.length,
          bounds: params.bounds,
          eventTypes: params.event_types
        });
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              events,
              count: events.length 
            }) 
          }] 
        };
      } catch (error) {
        env.logger.error('Failed to generate test data', { 
          error: error instanceof Error ? error.message : String(error),
          params 
        });
        
        return { 
          content: [{ 
            type: "text", 
            text: JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              events: []
            }) 
          }] 
        };
      }
    }
  );
};
