// Type definitions for event-relay-mcp component

export interface EdgeEvent {
  id: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
  event_type: string;
  metadata?: Record<string, unknown>;
}

export interface HotspotData {
  geohash: string;
  count: number;
  last_updated: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface AlertRecord {
  id: string;
  geohash: string;
  count: number;
  threshold: number;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface IngestEventParams {
  event: EdgeEvent;
}

export interface GetHotspotsParams {
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  precision?: number;
  min_count?: number;
}

export interface GetAlertsParams {
  since?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  limit?: number;
}

export interface TestDataParams {
  count: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  event_types?: string[];
}