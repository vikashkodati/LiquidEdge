// Hotspot Analytics Database Schema
// Handles geospatial aggregations and hotspot data

export const schema = `
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    object_type TEXT NOT NULL,
    confidence_score REAL NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    timestamp DATETIME NOT NULL,
    geohash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_geohash_type ON events(geohash, object_type);
CREATE INDEX idx_events_timestamp ON events(timestamp);

CREATE TABLE IF NOT EXISTS hotspots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    geohash TEXT NOT NULL,
    object_type TEXT NOT NULL,
    detection_count INTEGER NOT NULL DEFAULT 0,
    avg_confidence REAL NOT NULL,
    first_detection DATETIME NOT NULL,
    last_detection DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(geohash, object_type)
);

CREATE INDEX idx_hotspots_geohash ON hotspots(geohash);
CREATE INDEX idx_hotspots_count ON hotspots(detection_count DESC);
CREATE INDEX idx_hotspots_last_detection ON hotspots(last_detection);
`;