/**
 * Socket Service
 * Manages WebSocket connection using Socket.IO client
 */

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✓ Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('✗ Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to arrival updates
  onArrivalUpdates(callback) {
    if (!this.socket) this.connect();
    this.socket.on('arrival_updates', callback);
  }

  // Subscribe to service alerts
  onServiceAlerts(callback) {
    if (!this.socket) this.connect();
    this.socket.on('service_alerts', callback);
  }

  // Subscribe to specific stop updates
  subscribeToStop(stopId) {
    if (!this.socket) this.connect();
    this.socket.emit('subscribe_stop', stopId);
  }

  // Unsubscribe from stop updates
  unsubscribeFromStop(stopId) {
    if (this.socket) {
      this.socket.emit('unsubscribe_stop', stopId);
    }
  }

  // Listen for stop-specific updates
  onStopUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('stop_arrival_update', callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Check connection status
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Create and export a single instance of the socket service
const socketService = new SocketService();
export default socketService;
