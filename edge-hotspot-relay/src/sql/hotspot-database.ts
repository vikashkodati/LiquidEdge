// SQL Schema for hotspot-database SmartSQL resource

export const schema = `
-- Detection Events Table
CREATE TABLE IF NOT EXISTS detection_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT UNIQUE NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    geohash TEXT NOT NULL,
    event_type TEXT NOT NULL,
    confidence REAL DEFAULT 1.0,
    metadata TEXT,
    detected_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hotspots Table
CREATE TABLE IF NOT EXISTS hotspots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    geohash TEXT UNIQUE NOT NULL,
    event_count INTEGER DEFAULT 0,
    last_event_at DATETIME,
    first_event_at DATETIME,
    geohash_level INTEGER NOT NULL,
    center_latitude REAL,
    center_longitude REAL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id TEXT UNIQUE NOT NULL,
    hotspot_geohash TEXT NOT NULL,
    threshold_value INTEGER NOT NULL,
    actual_count INTEGER NOT NULL,
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    triggered_at DATETIME NOT NULL,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_events_geohash ON detection_events(geohash);
CREATE INDEX IF NOT EXISTS idx_events_detected_at ON detection_events(detected_at);
CREATE INDEX IF NOT EXISTS idx_hotspots_geohash ON hotspots(geohash);
CREATE INDEX IF NOT EXISTS idx_hotspots_updated_at ON hotspots(updated_at);
CREATE INDEX IF NOT EXISTS idx_alerts_geohash ON alerts(hotspot_geohash);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at ON alerts(triggered_at);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);

-- Foreign Key Relationships
-- Note: SQLite foreign key constraints are enforced at runtime
-- Alerts reference hotspots
-- ALTER TABLE alerts ADD CONSTRAINT fk_alerts_hotspot 
-- FOREIGN KEY (hotspot_geohash) REFERENCES hotspots(geohash);
`;

export const tables = [
    'detection_events',
    'hotspots', 
    'alerts'
];