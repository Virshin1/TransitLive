/**
 * Stop Model
 * Schema for transit stops/stations
 */

const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  stopId: {
    type: String,
    required: true,
    unique: true
  },
  stopName: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  routes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  }],
  facilities: {
    wheelchair: { type: Boolean, default: false },
    shelter: { type: Boolean, default: false },
    realTimeDisplay: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Stop', stopSchema);
