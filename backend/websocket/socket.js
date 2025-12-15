/**
 * WebSocket Handler
 * Manages Socket.IO connections and events
 */

let connectedClients = 0;

function setupWebSocket(io) {
  io.on('connection', (socket) => {
    connectedClients++;
    console.log(`✓ Client connected (${connectedClients} active)`);

    // Send initial connection confirmation
    socket.emit('connected', {
      message: 'Connected to TransitLive',
      timestamp: new Date()
    });

    // Handle client requesting specific stop updates
    socket.on('subscribe_stop', (stopId) => {
      socket.join(`stop_${stopId}`);
      console.log(`Client subscribed to stop ${stopId}`);
    });

    // Handle client unsubscribing from stop updates
    socket.on('unsubscribe_stop', (stopId) => {
      socket.leave(`stop_${stopId}`);
      console.log(`Client unsubscribed from stop ${stopId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      connectedClients--;
      console.log(`✓ Client disconnected (${connectedClients} active)`);
    });
  });
}

module.exports = setupWebSocket;
