# Edge Event → Hotspot Relay Demo Script

## 🎯 **5-Minute Live Demo**

### Setup (30 seconds)
```bash
# Show the application structure
tree src/ -I node_modules
```

### 1. Test Suite Demo (1 minute)
```bash
# Show all tests passing
pnpm test --run
```
*"All 72 tests pass - this shows our geospatial processing, event validation, and alert generation works correctly."*

### 2. Component Overview (1 minute)
```bash
# Show the core components
ls src/*/
```
*"We have 3 main components:"*
- **Event Relay MCP**: HTTP endpoints for ingestion and queries
- **Hotspot Aggregation Observer**: Real-time geospatial clustering  
- **Alert Generation Observer**: Threshold-based alerting

### 3. Architecture Demo (1.5 minutes)
```bash
# Show the manifest file
cat raindrop.manifest
```
*"This shows our event-driven architecture with SmartBuckets, SmartSQL, and observers."*

### 4. Code Walkthrough (1.5 minutes)
```bash
# Show geohash implementation
head -20 src/event-relay-mcp/utils.ts
```
*"Here's our geospatial indexing - we use precision-5 geohash for ~2.4km grid cells"*

```bash
# Show event structure
cat src/event-relay-mcp/interfaces.ts | grep -A 10 "EdgeEvent"
```

## 📊 **Data Flow Explanation** 
*"Edge sensors → HTTP ingestion → Geohash clustering → Alert generation → Stakeholder notifications"*

---

## 🎬 **Advanced Demo Options**

### Option A: **Postman/Curl Demo**
Show API endpoints working with sample data

### Option B: **Architecture Diagram**
Visual explanation of the event-driven pipeline

### Option C: **Use Case Scenarios**
- Maritime traffic monitoring
- Vehicle fleet management  
- Surveillance coordination

### Option D: **Technical Deep Dive**
- Geohash algorithm explanation
- Real-time aggregation patterns
- Scalability discussion