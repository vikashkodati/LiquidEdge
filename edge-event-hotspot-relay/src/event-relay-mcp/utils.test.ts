import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EdgeEvent } from './interfaces.js';
import {
  validateEdgeEvent,
  calculateGeohash,
  storeEdgeEvent,
  retrieveHotspots,
  retrieveAlerts,
  generateTestEvent
} from './utils.js';

describe('Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateEdgeEvent', () => {
    it('should validate a valid edge event', () => {
      const validEvent: EdgeEvent = {
        id: 'test-123',
        timestamp: Date.now(),
        location: { latitude: 37.7749, longitude: -122.4194 },
        event_type: 'detection'
      };

      const result = validateEdgeEvent(validEvent);
      expect(result).toBe(true);
    });

    it('should reject event with missing id', () => {
      const invalidEvent: EdgeEvent = {
        id: '',
        timestamp: Date.now(),
        location: { latitude: 37.7749, longitude: -122.4194 },
        event_type: 'detection'
      };

      const result = validateEdgeEvent(invalidEvent);
      expect(result).toBe(false);
    });

    it('should reject event with invalid coordinates', () => {
      const invalidEvent: EdgeEvent = {
        id: 'test-123',
        timestamp: Date.now(),
        location: { latitude: 200, longitude: -300 },
        event_type: 'detection'
      };

      const result = validateEdgeEvent(invalidEvent);
      expect(result).toBe(false);
    });

    it('should reject event with missing event_type', () => {
      const invalidEvent: EdgeEvent = {
        id: 'test-123',
        timestamp: Date.now(),
        location: { latitude: 37.7749, longitude: -122.4194 },
        event_type: ''
      };

      const result = validateEdgeEvent(invalidEvent);
      expect(result).toBe(false);
    });
  });

  describe('calculateGeohash', () => {
    it('should calculate geohash for valid coordinates', () => {
      const geohash = calculateGeohash(37.7749, -122.4194, 6);
      expect(geohash).toMatch(/^[0-9a-z]{6}$/);
    });

    it('should handle different precision levels', () => {
      const geohash4 = calculateGeohash(37.7749, -122.4194, 4);
      const geohash8 = calculateGeohash(37.7749, -122.4194, 8);
      
      expect(geohash4).toMatch(/^[0-9a-z]{4}$/);
      expect(geohash8).toMatch(/^[0-9a-z]{8}$/);
    });

    it('should handle edge coordinates', () => {
      const northPole = calculateGeohash(90, 0, 6);
      const southPole = calculateGeohash(-90, 0, 6);
      
      expect(northPole).toMatch(/^[0-9a-z]{6}$/);
      expect(southPole).toMatch(/^[0-9a-z]{6}$/);
    });
  });

  describe('storeEdgeEvent', () => {
    it('should store edge event successfully', async () => {
      const event: EdgeEvent = {
        id: 'test-123',
        timestamp: Date.now(),
        location: { latitude: 37.7749, longitude: -122.4194 },
        event_type: 'detection'
      };

      await expect(storeEdgeEvent(event)).resolves.not.toThrow();
    });

    it('should handle storage failures', async () => {
      const event: EdgeEvent = {
        id: 'test-123',
        timestamp: Date.now(),
        location: { latitude: 37.7749, longitude: -122.4194 },
        event_type: 'detection'
      };

      await expect(storeEdgeEvent(event)).rejects.toThrow();
    });
  });

  describe('retrieveHotspots', () => {
    it('should retrieve hotspots with bounds filter', async () => {
      const bounds = { north: 37.8, south: 37.7, east: -122.3, west: -122.5 };
      
      await expect(retrieveHotspots(bounds, 6, 10)).resolves.toEqual([]);
    });

    it('should retrieve all hotspots when no filters provided', async () => {
      await expect(retrieveHotspots()).resolves.toEqual([]);
    });

    it('should handle retrieval errors', async () => {
      await expect(retrieveHotspots()).resolves.toEqual([]);
    });
  });

  describe('retrieveAlerts', () => {
    it('should retrieve alerts with time filter', async () => {
      const since = Date.now() - 3600000; // 1 hour ago
      
      await expect(retrieveAlerts(since, 'medium', 50)).resolves.toEqual([]);
    });

    it('should retrieve alerts with severity filter', async () => {
      await expect(retrieveAlerts(undefined, 'high')).resolves.toEqual([]);
    });

    it('should handle retrieval errors', async () => {
      await expect(retrieveAlerts()).resolves.toEqual([]);
    });
  });

  describe('generateTestEvent', () => {
    it('should generate test event with default parameters', () => {
      const event = generateTestEvent();
      
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('timestamp');
      expect(event).toHaveProperty('location');
      expect(event).toHaveProperty('event_type');
    });

    it('should generate test event within bounds', () => {
      const bounds = { north: 37.8, south: 37.7, east: -122.3, west: -122.5 };
      const event = generateTestEvent(bounds);
      
      expect(event.location.latitude).toBeGreaterThanOrEqual(bounds.south);
      expect(event.location.latitude).toBeLessThanOrEqual(bounds.north);
      expect(event.location.longitude).toBeGreaterThanOrEqual(bounds.west);
      expect(event.location.longitude).toBeLessThanOrEqual(bounds.east);
    });

    it('should use specified event types', () => {
      const eventTypes = ['detection', 'movement', 'anomaly'];
      const event = generateTestEvent(undefined, eventTypes);
      
      expect(eventTypes).toContain(event.event_type);
    });
  });
});