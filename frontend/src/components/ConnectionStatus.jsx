/**
 * Connection Status Component
 * Shows WebSocket connection status with visual indicator
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from './ui/badge';
import socketService from '../services/socket';

function ConnectionStatus() {
  // Track connection state
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const socket = socketService.connect();

    // Listen for connection events
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Check initial connection state
    setIsConnected(socket.connected);

    // Cleanup listeners on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant={isConnected ? "success" : "error"}
        className="flex items-center space-x-2 px-3 py-2"
      >
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Disconnected</span>
          </>
        )}
      </Badge>
    </div>
  );
}

export default ConnectionStatus;
