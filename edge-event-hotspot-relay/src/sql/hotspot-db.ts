// SQL Schema for hotspot-db SmartSQL resource

export const createTables = `
CREATE TABLE IF NOT EXISTS hotspot_counts (
    geohash TEXT NOT NULL,
    object_type TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    avg_confidence REAL DEFAULT 0.0,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (geohash, object_type)
);
`;

export const createIndexes = `
CREATE INDEX IF NOT EXISTS idx_hotspot_counts_last_seen ON hotspot_counts(last_seen);
CREATE INDEX IF NOT EXISTS idx_hotspot_counts_count ON hotspot_counts(count);
`;

// Execute all schema creation
export const initializeSchema = () => {
    return [createTables, createIndexes].join('\n');
};