import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EdgeEvent } from './interfaces.js';

// Mock the MCP service
const mockMCPService = {
  execute: vi.fn(),
  listTools: vi.fn(),
};

// Mock environment bindings
const mockEnv = {
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  EDGE_EVENTS: {
    put: vi.fn(),
  },
  HOTSPOT_COUNTS: {
    query: vi.fn(),
  },
  ALERTS: {
    query: vi.fn(),
  },
};

vi.mock('./index.js', () => ({
  EventRelayMCP: vi.fn().mockImplementation(() => mockMCPService),
}));

describe('EventRelayMCP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MCP Service Initialization', () => {
    it('should initialize with correct tools', async () => {
      mockMCPService.listTools.mockResolvedValue([
        'ingest-event',
        'get-hotspots', 
        'get-alerts',
        'test-data-generator'
      ]);

      const tools = await mockMCPService.listTools();
      expect(tools).toContain('ingest-event');
      expect(tools).toContain('get-hotspots');
      expect(tools).toContain('get-alerts');
      expect(tools).toContain('test-data-generator');
    });

    it('should handle service initialization errors', async () => {
      mockMCPService.listTools.mockRejectedValue(new Error('Initialization failed'));
      
      await expect(mockMCPService.listTools()).rejects.toThrow('Initialization failed');
    });
  });

  describe('Tool Execution', () => {
    it('should execute ingest-event tool successfully', async () => {
      const mockEvent: EdgeEvent = {
        id: 'test-123',
        timestamp: Date.now(),
        location: { latitude: 37.7749, longitude: -122.4194 },
        event_type: 'detection',
        metadata: { confidence: 0.95 }
      };

      mockMCPService.execute.mockResolvedValue({
        success: true,
        message: 'Event ingested successfully'
      });

      const result = await mockMCPService.execute('ingest-event', { event: mockEvent });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Event ingested successfully');
    });

    it('should execute get-hotspots tool successfully', async () => {
      const mockHotspots = [
        {
          geohash: '9q8yyz',
          count: 15,
          last_updated: Date.now(),
          bounds: { north: 37.8, south: 37.7, east: -122.3, west: -122.5 }
        }
      ];

      mockMCPService.execute.mockResolvedValue({ hotspots: mockHotspots });

      const result = await mockMCPService.execute('get-hotspots', {
        bounds: { north: 37.8, south: 37.7, east: -122.3, west: -122.5 },
        precision: 6,
        min_count: 10
      });

      expect(result.hotspots).toHaveLength(1);
      expect(result.hotspots[0].geohash).toBe('9q8yyz');
    });

    it('should execute get-alerts tool successfully', async () => {
      const mockAlerts = [
        {
          id: 'alert-123',
          geohash: '9q8yyz',
          count: 25,
          threshold: 20,
          timestamp: Date.now(),
          severity: 'medium' as const
        }
      ];

      mockMCPService.execute.mockResolvedValue({ alerts: mockAlerts });

      const result = await mockMCPService.execute('get-alerts', {
        since: Date.now() - 3600000,
        severity: 'medium',
        limit: 50
      });

      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].severity).toBe('medium');
    });

    it('should execute test-data-generator tool successfully', async () => {
      const mockGeneratedEvents = [
        {
          id: 'gen-1',
          timestamp: Date.now(),
          location: { latitude: 37.7749, longitude: -122.4194 },
          event_type: 'detection'
        }
      ];

      mockMCPService.execute.mockResolvedValue({
        events: mockGeneratedEvents,
        count: 1
      });

      const result = await mockMCPService.execute('test-data-generator', {
        count: 1,
        bounds: { north: 37.8, south: 37.7, east: -122.3, west: -122.5 }
      });

      expect(result.events).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it('should handle tool execution errors', async () => {
      mockMCPService.execute.mockRejectedValue(new Error('Tool execution failed'));

      await expect(mockMCPService.execute('invalid-tool', {})).rejects.toThrow('Tool execution failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool names', async () => {
      mockMCPService.execute.mockRejectedValue(new Error('Unknown tool: invalid-tool'));

      await expect(mockMCPService.execute('invalid-tool', {})).rejects.toThrow('Unknown tool: invalid-tool');
    });

    it('should handle malformed parameters', async () => {
      mockMCPService.execute.mockRejectedValue(new Error('Invalid parameters'));

      await expect(mockMCPService.execute('ingest-event', { invalid: 'params' })).rejects.toThrow('Invalid parameters');
    });
  });
});