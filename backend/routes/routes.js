/**
 * Routes API
 * Handles transit route information
 */

const express = require('express');
const Route = require('../models/Route');

const router = express.Router();

// GET /api/routes - Get all routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true })
      .populate('stops', 'stopId stopName')
      .sort({ routeId: 1 });
    
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// GET /api/routes/:id - Get single route
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('stops', 'stopId stopName latitude longitude');
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// GET /api/routes/:id/vehicle-position - Get vehicle position and visited stops for route
router.get('/:id/vehicle-position', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Get vehicle positions from simulator
    const { vehiclePositions, predictions } = require('../services/gtfsSimulator');
    
    // Find vehicle for this route
    let vehicleData = null;
    for (const [vehicleId, position] of vehiclePositions.entries()) {
      if (position.routeId.toString() === req.params.id) {
        vehicleData = {
          vehicleId,
          currentStopIndex: position.currentStopIndex,
          visitedStops: position.visitedStops,
          totalStops: position.totalStops
        };
        break;
      }
    }
    
    // Get prediction data to include visited status
    const stopStatuses = [];
    for (const [key, prediction] of predictions.entries()) {
      if (prediction.routeId.toString() === req.params.id) {
        stopStatuses.push({
          stopId: prediction.stopId.toString(),
          stopIndex: prediction.stopIndex,
          visited: prediction.visited,
          predictedArrival: prediction.predictedArrival
        });
      }
    }
    
    res.json({
      vehicle: vehicleData,
      stopStatuses: stopStatuses.sort((a, b) => a.stopIndex - b.stopIndex)
    });
  } catch (error) {
    console.error('Error fetching vehicle position:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle position' });
  }
});

// GET /api/routes/type/:type - Get routes by type
router.get('/type/:type', async (req, res) => {
  try {
    const routes = await Route.find({ 
      routeType: req.params.type,
      isActive: true 
    }).populate('stops', 'stopId stopName');
    
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes by type:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

module.exports = router;
