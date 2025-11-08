// Alert System Database Schema
// Handles alert generation and management

export const schema = `
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    geohash TEXT NOT NULL,
    object_type TEXT NOT NULL,
    detection_count INTEGER NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    threshold_exceeded INTEGER NOT NULL,
    time_window_minutes INTEGER NOT NULL,
    alert_timestamp DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_timestamp ON alerts(alert_timestamp DESC);
CREATE INDEX idx_alerts_geohash ON alerts(geohash);
CREATE INDEX idx_alerts_status ON alerts(status);
`;