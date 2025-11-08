// Type definitions for alert-generation-observer component

export interface HotspotCountUpdate {
  geohash: string;
  count: number;
  previous_count: number;
  last_updated: number;
  precision: number;
}

export interface AlertThreshold {
  geohash_prefix?: string;
  min_count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  time_window_ms: number;
}

export interface Alert {
  id: string;
  geohash: string;
  count: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface AlertConfig {
  thresholds: AlertThreshold[];
  cooldown_ms: number;
  batch_size: number;
}

export interface ProcessingResult {
  alerts_generated: number;
  alerts_suppressed: number;
  errors: string[];
}