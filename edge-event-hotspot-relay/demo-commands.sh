#!/bin/bash

# Edge Event → Hotspot Relay Demo Commands
echo "🚀 Edge Event → Hotspot Relay Demo Setup"

# 1. Show clean test results
echo -e "\n📋 Running all tests..."
pnpm test --run

# 2. Generate sample test data
echo -e "\n🎲 Generating sample detection events..."
node -e "
const { generateTestEvent } = require('./src/event-relay-mcp/utils.js');
const bounds = { north: 47.8, south: 47.4, east: -122.0, west: -122.6 }; // Seattle area
const eventTypes = ['ship', 'aircraft', 'vehicle'];

console.log('📍 Sample Edge Events:');
for (let i = 0; i < 5; i++) {
  const event = generateTestEvent(bounds, eventTypes);
  console.log(JSON.stringify(event, null, 2));
  console.log('---');
}
"

# 3. Show geohash calculation
echo -e "\n🗺️  Geohash Example (Seattle):"
node -e "
const { calculateGeohash } = require('./src/event-relay-mcp/utils.js');
const lat = 47.6062, lng = -122.3321; // Seattle coordinates
const precision6 = calculateGeohash(lat, lng, 6);
const precision4 = calculateGeohash(lat, lng, 4);
console.log('Seattle coordinates:', lat, lng);
console.log('Geohash (precision 6):', precision6, '(~610m grid)');
console.log('Geohash (precision 4):', precision4, '(~20km grid)');
"

# 4. Show component structure
echo -e "\n🏗️  Application Components:"
tree src/ -I node_modules -L 2

# 5. Show manifest
echo -e "\n📄 LiquidMetal Manifest:"
if [ -f "raindrop.manifest" ]; then
  cat raindrop.manifest
else
  echo "Manifest file not found - this would show the LiquidMetal component definitions"
fi

echo -e "\n✅ Demo setup complete!"
echo "🎯 Use this data for your presentation"