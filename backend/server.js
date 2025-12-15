/**
 * TransitLive Backend Server
 * Main entry point for the Express.js server with Socket.IO integration
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const routesRouter = require('./routes/routes');
const stopsRouter = require('./routes/stops');
const alertsRouter = require('./routes/alerts');
const authRouter = require('./routes/auth');

// Import WebSocket handler and simulator
const setupWebSocket = require('./websocket/socket');
const { startGTFSSimulator } = require('./services/gtfsSimulator');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware - Configure CORS to allow frontend requests
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transitlive')
  .then(() => {
    console.log('✓ Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/routes', routesRouter);
app.use('/api/stops', stopsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Setup WebSocket handlers
setupWebSocket(io);

// Start GTFS-RT simulator
startGTFSSimulator(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ WebSocket server ready`);
  console.log(`✓ GTFS-RT simulator started`);
});
