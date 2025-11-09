# Live Demo API Commands

## 🚀 Start the Demo Server

```bash
# Start the demo server (simulates LiquidMetal deployment)
node demo-server.js

# Server will start on http://localhost:3000
# Keep this terminal open and use a new terminal for curl commands
```

## 📡 API Demo Commands

### 1. Check Server Status
```bash
curl -X GET http://localhost:3000/api/status
```

### 2. Ingest Ship Detection Events
```bash
# Ship detection in Puget Sound
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 47.61,
    "lon": -122.33,
    "object_type": "ship",
    "confidence": 0.92
  }'

# Another ship nearby (same geohash - will create hotspot)
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 47.62,
    "lon": -122.34,
    "object_type": "ship", 
    "confidence": 0.88
  }'
```

### 3. Ingest Multiple Events (Create Hotspot)
```bash
# Send 12 ship events to trigger an alert
for i in {1..12}; do
  curl -X POST http://localhost:3000/api/ingest \
    -H "Content-Type: application/json" \
    -d "{
      \"lat\": 47.6$((RANDOM % 10)),
      \"lon\": -122.3$((RANDOM % 10)),
      \"object_type\": \"ship\",
      \"confidence\": 0.$((RANDOM % 99 + 80))
    }"
  echo " Event $i sent"
done
```

### 4. Query Hotspots
```bash
# Get all hotspots
curl -X GET http://localhost:3000/api/hotspots

# Get hotspots with minimum count
curl -X GET "http://localhost:3000/api/hotspots?min_count=5"

# Get hotspots in geographic bounds
curl -X GET "http://localhost:3000/api/hotspots?north=47.8&south=47.4&east=-122.0&west=-122.6"
```

### 5. Check Alerts
```bash
# Get all alerts
curl -X GET http://localhost:3000/api/alerts

# Get critical alerts only
curl -X GET "http://localhost:3000/api/alerts?severity=critical"

# Get recent alerts (last hour)
curl -X GET "http://localhost:3000/api/alerts?since=$(date -d '1 hour ago' +%s)"

# Limit to 5 alerts
curl -X GET "http://localhost:3000/api/alerts?limit=5"
```

## 🎬 Complete Demo Scenario

### Scenario: Maritime Traffic Surge Detection

```bash
# 1. Start with server status
echo "=== Server Status ==="
curl -X GET http://localhost:3000/api/status | jq

# 2. Send initial ship events
echo -e "\n=== Sending Ship Detections ==="
for i in {1..15}; do
  curl -s -X POST http://localhost:3000/api/ingest \
    -H "Content-Type: application/json" \
    -d "{
      \"lat\": 47.$((600 + RANDOM % 50)),
      \"lon\": -122.$((300 + RANDOM % 50)), 
      \"object_type\": \"ship\",
      \"confidence\": 0.$((RANDOM % 20 + 80))
    }" | jq '.message'
done

# 3. Check resulting hotspots
echo -e "\n=== Current Hotspots ==="
curl -s -X GET http://localhost:3000/api/hotspots | jq

# 4. Check generated alerts  
echo -e "\n=== Generated Alerts ==="
curl -s -X GET http://localhost:3000/api/alerts | jq

# 5. Send aircraft events (different object type)
echo -e "\n=== Adding Aircraft Detections ==="
for i in {1..8}; do
  curl -s -X POST http://localhost:3000/api/ingest \
    -H "Content-Type: application/json" \
    -d "{
      \"lat\": 47.$((450 + RANDOM % 30)),
      \"lon\": -122.$((310 + RANDOM % 30)),
      \"object_type\": \"aircraft\", 
      \"confidence\": 0.$((RANDOM % 15 + 85))
    }" | jq '.message'
done

# 6. Final status
echo -e "\n=== Final System Status ==="
curl -s -X GET http://localhost:3000/api/status | jq
```

## 🔍 What You'll See

1. **Event Ingestion**: Success messages with event IDs
2. **Hotspot Formation**: Geohash-based clustering of events
3. **Alert Generation**: Automatic alerts when count > 10
4. **Real-time Updates**: Immediate response to new events

## 🛑 Stop the Demo

```bash
# In the server terminal, press Ctrl+C to stop
# Or kill the process
pkill -f "node demo-server.js"
```

## 📊 Understanding the Output

- **Events**: Each detection with coordinates and metadata
- **Hotspots**: Aggregated counts per geohash + object_type
- **Alerts**: Generated when hotspot exceeds threshold
- **Geohash**: 5-character grid identifier for ~2.4km areas

This demo simulates the exact functionality you'd get from the LiquidMetal deployment!