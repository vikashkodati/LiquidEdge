import { EdgeEvent, HotspotData, AlertRecord } from './interfaces.js';

/**
 * Validation utilities for edge events and related data
 */

/**
 * Validates an edge event object for completeness and data integrity
 * @param event - The edge event to validate
 * @returns true if the event is valid, false otherwise
 */
export function validateEdgeEvent(event: EdgeEvent): boolean {
  if (!event || typeof event !== 'object') {
    return false;
  }

  // Check required string fields
  if (!isValidString(event.id) || !isValidString(event.event_type)) {
    return false;
  }
  
  // Check timestamp
  if (!isValidTimestamp(event.timestamp)) {
    return false;
  }
  
  // Check location object
  if (!event.location || !isValidCoordinates(event.location)) {
    return false;
  }
  
  return true;
}

/**
 * Validates if a string is non-empty and properly trimmed
 */
function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Validates if a timestamp is a positive number
 */
function isValidTimestamp(timestamp: unknown): timestamp is number {
  return typeof timestamp === 'number' && timestamp > 0 && isFinite(timestamp);
}

/**
 * Validates coordinate bounds for latitude and longitude
 */
function isValidCoordinates(location: { latitude: unknown; longitude: unknown }): boolean {
  const { latitude, longitude } = location;
  
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }
  
  if (!isFinite(latitude) || !isFinite(longitude)) {
    return false;
  }
  
  return isValidLatitude(latitude) && isValidLongitude(longitude);
}

/**
 * Validates latitude is within valid range [-90, 90]
 */
function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

/**
 * Validates longitude is within valid range [-180, 180]
 */
function isValidLongitude(lng: number): boolean {
  return lng >= -180 && lng <= 180;
}

/**
 * Geospatial utilities for coordinate processing
 */

// Base32 encoding characters used in geohash
const GEOHASH_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Calculates geohash for given coordinates using binary subdivision algorithm
 * @param latitude - Latitude coordinate (-90 to 90)
 * @param longitude - Longitude coordinate (-180 to 180)
 * @param precision - Desired geohash length (1-12, default 6)
 * @returns Geohash string representing the location
 */
export function calculateGeohash(latitude: number, longitude: number, precision: number = 6): string {
  // Input validation
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    throw new Error(`Invalid coordinates: lat=${latitude}, lng=${longitude}`);
  }
  
  if (!Number.isInteger(precision) || precision < 1 || precision > 12) {
    throw new Error(`Invalid precision: ${precision}. Must be integer between 1-12`);
  }
  
  return generateGeohash(latitude, longitude, precision);
}

/**
 * Core geohash generation using interleaved binary subdivision
 */
function generateGeohash(lat: number, lng: number, precision: number): string {
  let latRange = { min: -90.0, max: 90.0 };
  let lngRange = { min: -180.0, max: 180.0 };
  
  let bit = 0;
  let currentChar = 0;
  let geohash = '';
  let isLongitudeTurn = true; // Start with longitude
  
  while (geohash.length < precision) {
    if (isLongitudeTurn) {
      currentChar = processBitForDimension(lng, lngRange, currentChar, bit);
    } else {
      currentChar = processBitForDimension(lat, latRange, currentChar, bit);
    }
    
    isLongitudeTurn = !isLongitudeTurn;
    
    if (bit < 4) {
      bit++;
    } else {
      geohash += GEOHASH_BASE32[currentChar];
      bit = 0;
      currentChar = 0;
    }
  }
  
  return geohash;
}

/**
 * Processes a single bit for either latitude or longitude dimension
 */
function processBitForDimension(
  coordinate: number, 
  range: { min: number; max: number }, 
  currentChar: number, 
  bit: number
): number {
  const mid = (range.min + range.max) / 2;
  
  if (coordinate >= mid) {
    currentChar |= (1 << (4 - bit));
    range.min = mid;
  } else {
    range.max = mid;
  }
  
  return currentChar;
}

/**
 * Data persistence utilities
 */

// In-memory storage for testing (will be replaced with actual persistence layer)
const eventStorage = new Map<string, EdgeEvent>();

/**
 * Stores an edge event with validation and duplicate checking
 * @param event - The edge event to store
 * @throws Error if event is invalid or already exists
 */
export async function storeEdgeEvent(event: EdgeEvent): Promise<void> {
  try {
    // Validate event before storing
    if (!validateEdgeEvent(event)) {
      throw new Error('Invalid edge event: validation failed');
    }
    
    // Check for duplicate event IDs
    if (eventStorage.has(event.id)) {
      throw new Error(`Storage failure: event with ID '${event.id}' already exists`);
    }
    
    // Store the event (mock implementation for tests)
    // In production, this would interface with SmartBucket: env.edge_events.put()
    eventStorage.set(event.id, { ...event });
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    
  } catch (error) {
    // Re-throw with additional context
    const message = error instanceof Error ? error.message : 'Unknown storage error';
    throw new Error(`Failed to store edge event: ${message}`);
  }
}

/**
 * Data retrieval utilities
 */

/**
 * Retrieves hotspot data with optional filtering
 * @param bounds - Geographic bounds to filter results
 * @param precision - Geohash precision level
 * @param minCount - Minimum event count threshold
 * @returns Array of hotspot data matching the criteria
 */
export async function retrieveHotspots(
  bounds?: { north: number; south: number; east: number; west: number },
  precision?: number,
  minCount?: number
): Promise<HotspotData[]> {
  try {
    // Validate optional parameters
    if (bounds && !isValidBounds(bounds)) {
      throw new Error('Invalid geographic bounds provided');
    }
    
    if (precision !== undefined && (!Number.isInteger(precision) || precision < 1 || precision > 12)) {
      throw new Error('Invalid precision: must be integer between 1-12');
    }
    
    if (minCount !== undefined && (!Number.isInteger(minCount) || minCount < 1)) {
      throw new Error('Invalid minCount: must be positive integer');
    }
    
    // Mock implementation - in production this would query SmartSQL: env.hotspot_db.query()
    // Return empty array for now to maintain test compatibility
    await new Promise(resolve => setTimeout(resolve, 0));
    return [];
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown retrieval error';
    throw new Error(`Failed to retrieve hotspots: ${message}`);
  }
}

/**
 * Retrieves alert records with optional filtering
 * @param since - Timestamp to filter alerts from
 * @param severity - Alert severity level to filter by
 * @param limit - Maximum number of results to return
 * @returns Array of alert records matching the criteria
 */
export async function retrieveAlerts(
  since?: number,
  severity?: 'low' | 'medium' | 'high' | 'critical',
  limit?: number
): Promise<AlertRecord[]> {
  try {
    // Validate optional parameters
    if (since !== undefined && (!Number.isInteger(since) || since < 0)) {
      throw new Error('Invalid since timestamp: must be non-negative integer');
    }
    
    if (severity !== undefined && !isValidSeverity(severity)) {
      throw new Error('Invalid severity: must be low, medium, high, or critical');
    }
    
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 1000)) {
      throw new Error('Invalid limit: must be integer between 1-1000');
    }
    
    // Mock implementation - in production this would query SmartBucket: env.alerts.list()
    // Return empty array for now to maintain test compatibility
    await new Promise(resolve => setTimeout(resolve, 0));
    return [];
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown retrieval error';
    throw new Error(`Failed to retrieve alerts: ${message}`);
  }
}

/**
 * Validates geographic bounds object
 */
function isValidBounds(bounds: { north: number; south: number; east: number; west: number }): boolean {
  const { north, south, east, west } = bounds;
  
  return isValidLatitude(north) && 
         isValidLatitude(south) && 
         isValidLongitude(east) && 
         isValidLongitude(west) &&
         north >= south &&
         east >= west;
}

/**
 * Validates alert severity level
 */
function isValidSeverity(severity: string): severity is 'low' | 'medium' | 'high' | 'critical' {
  return ['low', 'medium', 'high', 'critical'].includes(severity);
}

// Implement test data generation
export function generateTestEvent(bounds?: any, eventTypes?: string[]): EdgeEvent {
  const defaultBounds = {
    north: 90,
    south: -90,
    east: 180,
    west: -180
  };
  
  const effectiveBounds = bounds || defaultBounds;
  const defaultEventTypes = ['detection', 'movement', 'anomaly'];
  const effectiveEventTypes = eventTypes || defaultEventTypes;
  
  // Generate random coordinates within bounds
  const latitude = Math.random() * (effectiveBounds.north - effectiveBounds.south) + effectiveBounds.south;
  const longitude = Math.random() * (effectiveBounds.east - effectiveBounds.west) + effectiveBounds.west;
  
  // Pick random event type
  const eventType = effectiveEventTypes[Math.floor(Math.random() * effectiveEventTypes.length)];
  
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    location: { latitude, longitude },
    event_type: eventType
  };
}