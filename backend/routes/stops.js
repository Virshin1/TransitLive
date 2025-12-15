/**
 * Stops API
 * Handles transit stop information
 */

const express = require('express');
const Stop = require('../models/Stop');

const router = express.Router();

// GET /api/stops - Get all stops
router.get('/', async (req, res) => {
  try {
    const stops = await Stop.find()
      .populate('routes', 'routeId routeName routeType color')
      .sort({ stopName: 1 });
    
    res.json(stops);
  } catch (error) {
    console.error('Error fetching stops:', error);
    res.status(500).json({ error: 'Failed to fetch stops' });
  }
});

// GET /api/stops/:id - Get single stop details
router.get('/:id', async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id)
      .populate('routes', 'routeId routeName routeType color description');
    
    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }

    res.json(stop);
  } catch (error) {
    console.error('Error fetching stop:', error);
    res.status(500).json({ error: 'Failed to fetch stop' });
  }
});

// GET /api/stops/nearby/:lat/:lng - Get stops near coordinates
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const maxDistance = req.query.distance || 1000; // meters

    // Simple distance calculation (for demo purposes)
    // In production, use MongoDB geospatial queries
    const stops = await Stop.find()
      .populate('routes', 'routeId routeName routeType color');
    
    const nearby = stops.filter(stop => {
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        stop.latitude,
        stop.longitude
      );
      return distance <= maxDistance;
    });

    res.json(nearby);
  } catch (error) {
    console.error('Error fetching nearby stops:', error);
    res.status(500).json({ error: 'Failed to fetch nearby stops' });
  }
});

// GET /api/stops/:id/predictions - Get predictions for a specific stop
router.get('/:id/predictions', async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);
    
    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }

    // Get predictions from the simulator
    const { predictions } = require('../services/gtfsSimulator');
    const stopPredictions = [];
    
    for (const [key, prediction] of predictions.entries()) {
      if (prediction.stopId.toString() === req.params.id) {
        // Calculate seconds until arrival
        const now = new Date();
        const arrivalTime = new Date(prediction.predictedArrival);
        const secondsUntil = Math.max(0, Math.floor((arrivalTime - now) / 1000));
        
        stopPredictions.push({
          ...prediction,
          secondsUntilArrival: secondsUntil
        });
      }
    }
    
    // Sort by arrival time (closest first)
    stopPredictions.sort((a, b) => a.secondsUntilArrival - b.secondsUntilArrival);
    
    res.json(stopPredictions);
  } catch (error) {
    console.error('Error fetching stop predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

module.exports = router;
