// Type definitions for hotspot-aggregation-observer component

export interface EdgeEventMessage {
  id: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
  event_type: string;
  metadata?: Record<string, unknown>;
}

export interface HotspotCount {
  geohash: string;
  count: number;
  last_updated: number;
  precision: number;
}

export interface GeohashBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface AggregationConfig {
  precision: number;
  batch_size: number;
  flush_interval_ms: number;
}

export interface ProcessingResult {
  processed_count: number;
  updated_geohashes: string[];
  errors: string[];
}