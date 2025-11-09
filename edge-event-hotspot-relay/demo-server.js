#!/usr/bin/env node

/**
 * Demo Server for Edge Event → Hotspot Relay
 * 
 * This simulates the HTTP endpoints that would be available 
 * after LiquidMetal deployment for demonstration purposes.
 */

const http = require('http');
const url = require('url');

// Simulate in-memory storage
let events = [];
let hotspots = new Map();
let alerts = [];

// Helper function to generate geohash (simplified for demo)
function simpleGeohash(lat, lng, precision = 5) {
  // Simplified geohash for demo - not the full algorithm
  const latGrid = Math.floor((lat + 90) * Math.pow(32, precision/2) / 180);
  const lngGrid = Math.floor((lng + 180) * Math.pow(32, precision/2) / 360);
  return `${latGrid.toString(32)}${lngGrid.toString(32)}`.substring(0, precision);
}

// Helper function to process events into hotspots
function updateHotspots(event) {
  const geohash = simpleGeohash(event.lat, event.lon);
  const key = `${geohash}:${event.object_type}`;
  
  if (hotspots.has(key)) {
    const existing = hotspots.get(key);
    existing.count += 1;
    existing.avg_confidence = (existing.avg_confidence + event.confidence) / 2;
    existing.last_seen = new Date().toISOString();
  } else {
    hotspots.set(key, {
      geohash,
      object_type: event.object_type,
      count: 1,
      avg_confidence: event.confidence,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString()
    });
  }
  
  // Generate alert if count > 10
  const hotspot = hotspots.get(key);
  if (hotspot.count > 10 && hotspot.count % 5 === 1) { // Alert every 5 events after threshold
    alerts.push({
      alert_id: `alert-${Date.now()}`,
      geohash,
      object_type: event.object_type,
      trigger_metric: hotspot.count,
      threshold: 10,
      severity: hotspot.count > 50 ? 'critical' : hotspot.count > 25 ? 'high' : 'medium',
      timestamp: new Date().toISOString(),
      message: `${event.object_type} hotspot detected: ${hotspot.count} events in grid ${geohash}`
    });
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${method} ${path}`);

  // POST /api/ingest - Ingest detection events
  if (path === '/api/ingest' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const event = JSON.parse(body);
        
        // Validate required fields
        if (!event.lat || !event.lon || !event.object_type) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing required fields: lat, lon, object_type' }));
          return;
        }

        // Add ID and timestamp if not provided
        if (!event.id) event.id = `event-${Date.now()}-${Math.random().toString(36).substring(2)}`;
        if (!event.timestamp) event.timestamp = new Date().toISOString();
        if (!event.confidence) event.confidence = 0.95;

        events.push(event);
        updateHotspots(event);

        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          message: `Event ${event.id} ingested successfully`,
          event_id: event.id
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // GET /api/hotspots - Query hotspots
  if (path === '/api/hotspots' && method === 'GET') {
    const query = parsedUrl.query;
    let results = Array.from(hotspots.values());

    // Filter by minimum count
    if (query.min_count) {
      const minCount = parseInt(query.min_count);
      results = results.filter(h => h.count >= minCount);
    }

    // Filter by bounds (simplified)
    if (query.north && query.south && query.east && query.west) {
      // For demo, just return all results (proper geo filtering would be more complex)
      console.log(`Filtering by bounds: N${query.north} S${query.south} E${query.east} W${query.west}`);
    }

    res.writeHead(200);
    res.end(JSON.stringify({ 
      hotspots: results,
      total: results.length,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // GET /api/alerts - Retrieve alerts
  if (path === '/api/alerts' && method === 'GET') {
    const query = parsedUrl.query;
    let results = [...alerts];

    // Filter by severity
    if (query.severity) {
      results = results.filter(a => a.severity === query.severity);
    }

    // Filter by timestamp
    if (query.since) {
      const sinceDate = new Date(parseInt(query.since) * 1000);
      results = results.filter(a => new Date(a.timestamp) > sinceDate);
    }

    // Limit results
    if (query.limit) {
      results = results.slice(0, parseInt(query.limit));
    }

    res.writeHead(200);
    res.end(JSON.stringify({ 
      alerts: results,
      total: results.length,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // GET /api/status - Server status
  if (path === '/api/status' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'running',
      version: '1.0.0',
      stats: {
        events: events.length,
        hotspots: hotspots.size,
        alerts: alerts.length
      },
      endpoints: [
        'POST /api/ingest',
        'GET /api/hotspots',
        'GET /api/alerts',
        'GET /api/status'
      ]
    }));
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Edge Event → Hotspot Relay Demo Server`);
  console.log(`📍 Server running at http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/ingest`);
  console.log(`   GET  http://localhost:${PORT}/api/hotspots`);
  console.log(`   GET  http://localhost:${PORT}/api/alerts`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`\n🎬 Ready for demo! Use the curl commands from curl-examples.md`);
});