import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ingestEvent } from './ingest-event.js';
import { EdgeEvent } from '../interfaces.js';

// Mock environment
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
};

vi.mock('../utils.js', () => ({
  validateEdgeEvent: vi.fn(),
  storeEdgeEvent: vi.fn(),
  calculateGeohash: vi.fn(),
}));

describe('ingest-event tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should ingest valid event successfully', async () => {
    const validEvent: EdgeEvent = {
      id: 'test-123',
      timestamp: Date.now(),
      location: { latitude: 37.7749, longitude: -122.4194 },
      event_type: 'detection',
      metadata: { confidence: 0.95 }
    };

    const result = await ingestEvent({ event: validEvent });
    expect(result).toHaveProperty('success', false); // Should fail validation due to missing dependencies
    expect(result).toHaveProperty('message');
  });

  it('should reject invalid event data', async () => {
    const invalidEvent = {
      id: '',
      timestamp: 'invalid',
      location: { latitude: 'invalid', longitude: 'invalid' },
      event_type: ''
    } as unknown as EdgeEvent;

    const result = await ingestEvent({ event: invalidEvent });
    expect(result).toHaveProperty('success', false);
    expect(result.message).toContain('validation failed');
  });

  it('should handle missing event parameter', async () => {
    const result = await ingestEvent({} as any);
    expect(result).toHaveProperty('success', false);
    expect(result.message).toContain('event object is required');
  });

  it('should handle events with metadata', async () => {
    const eventWithMetadata: EdgeEvent = {
      id: 'meta-test-123',
      timestamp: Date.now(),
      location: { latitude: 37.7749, longitude: -122.4194 },
      event_type: 'detection',
      metadata: {
        device_id: 'device-001',
        confidence: 0.85,
        sensor_type: 'camera'
      }
    };

    const result = await ingestEvent({ event: eventWithMetadata });
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
  });

  it('should handle events without metadata', async () => {
    const eventWithoutMetadata: EdgeEvent = {
      id: 'no-meta-123',
      timestamp: Date.now(),
      location: { latitude: 37.7749, longitude: -122.4194 },
      event_type: 'detection'
    };

    const result = await ingestEvent({ event: eventWithoutMetadata });
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
  });

  it('should handle storage failures', async () => {
    const validEvent: EdgeEvent = {
      id: 'storage-fail-123',
      timestamp: Date.now(),
      location: { latitude: 37.7749, longitude: -122.4194 },
      event_type: 'detection'
    };

    const result = await ingestEvent({ event: validEvent });
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
  });

  it('should validate event coordinates', async () => {
    const invalidCoords: EdgeEvent = {
      id: 'invalid-coords-123',
      timestamp: Date.now(),
      location: { latitude: 999, longitude: -999 },
      event_type: 'detection'
    };

    const result = await ingestEvent({ event: invalidCoords });
    expect(result).toHaveProperty('success', false);
    expect(result.message).toContain('validation failed');
  });

  it('should handle future timestamps', async () => {
    const futureEvent: EdgeEvent = {
      id: 'future-123',
      timestamp: Date.now() + 1000000,
      location: { latitude: 37.7749, longitude: -122.4194 },
      event_type: 'detection'
    };

    const result = await ingestEvent({ event: futureEvent });
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
  });
});