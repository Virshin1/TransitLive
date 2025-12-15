/**
 * Alert Model
 * Schema for service alerts (delays, cancellations, maintenance)
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  alertType: {
    type: String,
    enum: ['delay', 'cancellation', 'maintenance', 'disruption', 'other'],
    required: true
  },
  affectedRoutes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  }],
  affectedStops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop'
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updateCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Alert', alertSchema);
