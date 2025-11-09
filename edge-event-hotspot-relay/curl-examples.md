# API Demo Examples

## 🌐 HTTP Endpoint Examples (When Deployed)

### 1. Ingest Detection Events
```bash
# Ship detection in Puget Sound
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 47.61,
    "lon": -122.33,
    "object_type": "ship",
    "confidence": 0.92,
    "timestamp": "2025-11-09T10:00:00Z"
  }'

# Aircraft detection near SeaTac
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 47.45,
    "lon": -122.31,
    "object_type": "aircraft", 
    "confidence": 0.88,
    "timestamp": "2025-11-09T10:01:00Z"
  }'
```

### 2. Query Hotspots
```bash
# Get current hotspot data
curl -X GET "http://localhost:3000/api/hotspots?precision=5&min_count=5"

# Get hotspots in specific area
curl -X GET "http://localhost:3000/api/hotspots?north=47.8&south=47.4&east=-122.0&west=-122.6"
```

### 3. Check Alerts
```bash
# Get recent alerts
curl -X GET "http://localhost:3000/api/alerts?since=1699527600&severity=medium"

# Get all critical alerts
curl -X GET "http://localhost:3000/api/alerts?severity=critical&limit=10"
```

## 🎯 Demo Scenarios

### Scenario 1: Maritime Traffic Surge
1. Send 15 ship detections to same geohash
2. Show hotspot creation
3. Trigger alert when threshold exceeded
4. Query alerts endpoint

### Scenario 2: Airport Activity Monitor  
1. Send mixed aircraft/vehicle detections
2. Show separate object type clustering
3. Demonstrate confidence averaging

### Scenario 3: Fleet Tracking
1. Send vehicle detections across region
2. Show geospatial distribution
3. Monitor for unusual concentrations