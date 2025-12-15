/**
 * GTFS-RT Simulator
 * Simulates real-time transit data updates
 * Generates arrival predictions, delays, and cancellations
 */

const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Alert = require('../models/Alert');

// Store current predictions in memory
const predictions = new Map();

// Store vehicle positions and visited stops
const vehiclePositions = new Map();

// Configuration
const UPDATE_INTERVAL = 3000; // Update every 3 seconds
const DELAY_PROBABILITY = 0.15; // 15% chance of delay
const CANCELLATION_PROBABILITY = 0.03; // 3% chance of cancellation

/**
 * Initialize predictions for all route-stop combinations
 */
async function initializePredictions() {
  try {
    const routes = await Route.find({ isActive: true }).populate('stops');
    
    for (const route of routes) {
      // Create a vehicle for this route
      const vehicleId = `VEH-${route.routeId}-${Math.floor(Math.random() * 100)}`;
      const currentStopIndex = Math.floor(Math.random() * Math.max(1, route.stops.length - 1));
      
      // Track vehicle position
      vehiclePositions.set(vehicleId, {
        routeId: route._id,
        currentStopIndex,
        visitedStops: route.stops.slice(0, currentStopIndex).map(s => s._id.toString()),
        totalStops: route.stops.length,
        direction: 'forward' // 'forward' or 'backward'
      });
      
      for (let i = 0; i < route.stops.length; i++) {
        const stop = route.stops[i];
        const key = `${route._id}_${stop._id}`;
        
        // Calculate arrival time based on position
        const minutesFromNow = (i - currentStopIndex) * 3 + Math.floor(Math.random() * 5);
        const arrivalTime = minutesFromNow > 0 
          ? new Date(Date.now() + minutesFromNow * 60000)
          : null; // Already passed this stop
        
        predictions.set(key, {
          routeId: route._id,
          routeName: route.routeName,
          routeType: route.routeType,
          color: route.color,
          stopId: stop._id,
          stopName: stop.stopName,
          predictedArrival: arrivalTime || generateRandomArrival(),
          status: 'on_time',
          delay: 0,
          vehicleId,
          stopIndex: i,
          visited: i < currentStopIndex,
          timestamp: new Date()
        });
      }
    }
    
    console.log(`✓ Initialized ${predictions.size} predictions`);
  } catch (error) {
    console.error('Error initializing predictions:', error);
  }
}

/**
 * Generate random arrival time (1-20 minutes from now)
 */
function generateRandomArrival() {
  const minutes = Math.floor(Math.random() * 20) + 1;
  return new Date(Date.now() + minutes * 60000);
}

/**
 * Update predictions with realistic changes
 */
function updatePredictions() {
  const updates = [];
  
  for (const [key, prediction] of predictions.entries()) {
    const vehiclePos = vehiclePositions.get(prediction.vehicleId);
    
    // Update visited status based on vehicle position and direction
    if (vehiclePos) {
      if (vehiclePos.direction === 'forward') {
        // In forward direction, all stops before current are visited
        prediction.visited = prediction.stopIndex < vehiclePos.currentStopIndex;
      } else {
        // In backward direction, all stops after current are visited
        prediction.visited = prediction.stopIndex > vehiclePos.currentStopIndex;
      }
    }
    
    // Decrease time to arrival by 1 second
    if (prediction.predictedArrival) {
      prediction.predictedArrival = new Date(prediction.predictedArrival.getTime() - 1000);
    }
    
    // If arrival time passed, update vehicle position
    if (prediction.predictedArrival && prediction.predictedArrival < new Date()) {
      
      if (vehiclePos && prediction.stopIndex === vehiclePos.currentStopIndex) {
        // Vehicle has arrived at this stop
        
        // Check if we need to reverse direction
        if (vehiclePos.direction === 'forward' && vehiclePos.currentStopIndex >= vehiclePos.totalStops - 1) {
          // Reached last stop, reverse direction
          vehiclePos.direction = 'backward';
          vehiclePos.currentStopIndex--;
        } else if (vehiclePos.direction === 'backward' && vehiclePos.currentStopIndex <= 0) {
          // Reached first stop, go forward again
          vehiclePos.direction = 'forward';
          vehiclePos.currentStopIndex++;
        } else {
          // Continue in current direction
          if (vehiclePos.direction === 'forward') {
            vehiclePos.currentStopIndex++;
          } else {
            vehiclePos.currentStopIndex--;
          }
        }
      }
      
      // Update arrival times based on current position and direction
      if (vehiclePos && vehiclePos.currentStopIndex >= 0 && vehiclePos.currentStopIndex < vehiclePos.totalStops) {
        let stopsAway;
        if (vehiclePos.direction === 'forward') {
          stopsAway = prediction.stopIndex - vehiclePos.currentStopIndex;
        } else {
          stopsAway = vehiclePos.currentStopIndex - prediction.stopIndex;
        }
        
        const minutesFromNow = stopsAway * 3 + Math.floor(Math.random() * 5);
        if (minutesFromNow > 0) {
          prediction.predictedArrival = new Date(Date.now() + minutesFromNow * 60000);
        } else if (stopsAway === 0) {
          prediction.predictedArrival = new Date(Date.now() + 30000); // 30 seconds
        }
      }
    }
    
    // Randomly introduce delays
    if (prediction.status === 'on_time' && Math.random() < DELAY_PROBABILITY / 100) {
      const delayMinutes = Math.floor(Math.random() * 10) + 2; // 2-11 minutes
      prediction.status = 'delayed';
      prediction.delay = delayMinutes;
      prediction.predictedArrival = new Date(prediction.predictedArrival.getTime() + delayMinutes * 60000);
    }
    
    // Randomly introduce cancellations
    if (prediction.status === 'on_time' && Math.random() < CANCELLATION_PROBABILITY / 100) {
      prediction.status = 'cancelled';
      prediction.delay = 0;
    }
    
    // Recovery from delays (50% chance each cycle if delayed)
    if (prediction.status === 'delayed' && Math.random() < 0.005) {
      prediction.status = 'on_time';
      prediction.delay = 0;
    }
    
    prediction.timestamp = new Date();
    updates.push({ ...prediction });
  }
  
  return updates;
}

/**
 * Generate random service alert
 */
async function generateRandomAlert(io) {
  try {
    const alertTypes = ['delay', 'maintenance', 'disruption'];
    const severities = ['info', 'warning', 'critical'];
    
    const routes = await Route.find({ isActive: true }).limit(5);
    if (routes.length === 0) return;
    
    const affectedRoute = routes[Math.floor(Math.random() * routes.length)];
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    // Check if there's already an active alert for this route and type
    const existingAlert = await Alert.findOne({
      isActive: true,
      alertType,
      affectedRoutes: affectedRoute._id
    });
    
    // Set alert duration based on severity
    let durationMinutes;
    if (severity === 'critical') {
      durationMinutes = Math.floor(Math.random() * 30) + 30; // 30-60 minutes
    } else if (severity === 'warning') {
      durationMinutes = Math.floor(Math.random() * 20) + 10; // 10-30 minutes
    } else {
      durationMinutes = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
    }
    
    const endTime = new Date(Date.now() + durationMinutes * 60000);
    
    if (existingAlert) {
      // Update existing alert instead of creating a new one
      const oldSeverity = existingAlert.severity;
      existingAlert.severity = severity;
      existingAlert.endTime = endTime; // Extend the alert duration
      existingAlert.updatedAt = new Date(); // Track when it was updated
      existingAlert.updateCount = (existingAlert.updateCount || 0) + 1; // Increment update counter
      
      // Update description based on severity change
      if (oldSeverity !== severity) {
        if (severity === 'critical') {
          existingAlert.description = `Critical service ${alertType} affecting ${affectedRoute.routeName}. Expect significant delays.`;
        } else if (severity === 'warning') {
          existingAlert.description = `Service ${alertType} affecting ${affectedRoute.routeName}. Please allow extra travel time.`;
        } else {
          existingAlert.description = `Minor service ${alertType} affecting ${affectedRoute.routeName}.`;
        }
      }
      
      await existingAlert.save();
      await existingAlert.populate('affectedRoutes', 'routeId routeName routeType');
      
      // Broadcast update to all clients
      io.emit('service_alerts', existingAlert);
      console.log(`✓ Updated ${severity} alert: ${existingAlert.title} (${oldSeverity} → ${severity}, update #${existingAlert.updateCount})`);
    } else {
      // Create new alert
      const description = severity === 'critical'
        ? `Critical service ${alertType} affecting ${affectedRoute.routeName}. Expect significant delays.`
        : severity === 'warning'
        ? `Service ${alertType} affecting ${affectedRoute.routeName}. Please allow extra travel time.`
        : `Minor service ${alertType} affecting ${affectedRoute.routeName}.`;
      
      const alert = new Alert({
        alertId: `ALERT-${Date.now()}`,
        title: `${alertType.charAt(0).toUpperCase() + alertType.slice(1)} on ${affectedRoute.routeName}`,
        description,
        severity,
        alertType,
        affectedRoutes: [affectedRoute._id],
        startTime: new Date(),
        endTime, // Alert will automatically expire
        isActive: true
      });
      
      await alert.save();
      await alert.populate('affectedRoutes', 'routeId routeName routeType');
      
      // Broadcast to all clients
      io.emit('service_alerts', alert);
      console.log(`✓ Generated ${severity} alert: ${alert.title} (expires in ${durationMinutes} min)`);
    }
  } catch (error) {
    console.error('Error generating alert:', error);
  }
}

/**
 * Check and deactivate expired alerts
 */
async function deactivateExpiredAlerts(io) {
  try {
    const now = new Date();
    
    // Find active alerts that have passed their end time
    const expiredAlerts = await Alert.find({
      isActive: true,
      endTime: { $ne: null, $lte: now }
    }).populate('affectedRoutes', 'routeId routeName routeType');
    
    for (const alert of expiredAlerts) {
      alert.isActive = false;
      await alert.save();
      
      // Notify clients that alert is now inactive
      io.emit('service_alerts', alert);
      console.log(`✓ Deactivated expired alert: ${alert.title}`);
    }
  } catch (error) {
    console.error('Error deactivating expired alerts:', error);
  }
}

/**
 * Start the GTFS-RT simulator
 */
function startGTFSSimulator(io) {
  // Initialize predictions
  initializePredictions();
  
  // Update predictions every few seconds
  setInterval(() => {
    const updates = updatePredictions();
    
    // Broadcast all updates
    io.emit('arrival_updates', updates);
    
    // Also send targeted updates to specific stop rooms
    updates.forEach(update => {
      io.to(`stop_${update.stopId}`).emit('stop_arrival_update', update);
    });
  }, UPDATE_INTERVAL);
  
  // Generate random alerts occasionally (every 2-5 minutes)
  setInterval(() => {
    if (Math.random() < 0.3) { // 30% chance
      generateRandomAlert(io);
    }
  }, 120000); // Check every 2 minutes
  
  // Check for expired alerts every 30 seconds
  setInterval(() => {
    deactivateExpiredAlerts(io);
  }, 30000);
  
  console.log('✓ GTFS-RT simulator started');
}

module.exports = {
  startGTFSSimulator,
  predictions,
  vehiclePositions
};
