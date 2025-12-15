/**
 * Alerts API
 * Handles service alerts and disruptions
 */

const express = require('express');
const Alert = require('../models/Alert');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/alerts - Get all alerts (with filtering)
router.get('/', async (req, res) => {
  try {
    const { active, severity, type } = req.query;
    
    const query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    if (severity) {
      query.severity = severity;
    }
    if (type) {
      query.alertType = type;
    }

    const alerts = await Alert.find(query)
      .populate('affectedRoutes', 'routeId routeName')
      .populate('affectedStops', 'stopId stopName')
      .sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// GET /api/alerts/:id - Get single alert
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('affectedRoutes', 'routeId routeName routeType')
      .populate('affectedStops', 'stopId stopName')
      .populate('createdBy', 'email');
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// POST /api/alerts - Create new alert (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      severity,
      alertType,
      affectedRoutes,
      affectedStops,
      startTime,
      endTime
    } = req.body;

    // Generate unique alert ID
    const alertId = `ALERT-${Date.now()}`;

    const alert = new Alert({
      alertId,
      title,
      description,
      severity: severity || 'info',
      alertType,
      affectedRoutes: affectedRoutes || [],
      affectedStops: affectedStops || [],
      startTime: startTime || new Date(),
      endTime: endTime || null,
      isActive: true,
      createdBy: req.user._id
    });

    await alert.save();
    
    // Populate references before sending
    await alert.populate('affectedRoutes affectedStops');

    // Emit socket event (will be handled by the socket controller)
    if (req.app.get('io')) {
      req.app.get('io').emit('service_alerts', alert);
    }

    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// PUT /api/alerts/:id - Update alert (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('affectedRoutes', 'routeId routeName')
      .populate('affectedStops', 'stopId stopName');
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('service_alerts', alert);
    }

    res.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// DELETE /api/alerts/:id - Delete alert (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

module.exports = router;
