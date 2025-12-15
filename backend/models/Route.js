/**
 * Route Model
 * Schema for transit routes (e.g., Bus 101, Metro Line A)
 */

const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: true,
    unique: true
  },
  routeName: {
    type: String,
    required: true
  },
  routeType: {
    type: String,
    enum: ['bus', 'metro', 'tram', 'train'],
    required: true
  },
  color: {
    type: String,
    default: '#0066CC'
  },
  description: {
    type: String,
    default: ''
  },
  stops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', routeSchema);
