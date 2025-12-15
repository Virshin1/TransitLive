/**
 * Stop Board Component
 * Real-time arrival predictions for a transit stop
 */

import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import socketService from '../services/socket';

function StopBoard({ stopId, stopName }) {
  // Store arrival predictions
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    socketService.connect();

    // Subscribe to arrival updates for this stop
    socketService.subscribeToStop(stopId);

    // Handle incoming arrival predictions
    const handleArrivals = (data) => {
      // Only update if data is for our stop
      if (data.stopId === stopId) {
        setPredictions(data.predictions || []);
      }
    };

    socketService.onArrivalUpdates(handleArrivals);

    // Cleanup: unsubscribe when component unmounts
    return () => {
      socketService.unsubscribeFromStop(stopId);
      socketService.off('arrival_updates', handleArrivals);
    };
  }, [stopId]);

  // Helper function to format time remaining
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return 'Arriving';
    if (minutes === 1) return '1 min';
    return `${minutes} mins`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span>{stopName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No upcoming arrivals
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map((prediction, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                {/* Route information */}
                <div className="flex items-center space-x-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white"
                    style={{
                      backgroundColor: prediction.routeColor || '#2c3e50',
                    }}
                  >
                    {prediction.routeShortName}
                  </div>
                  <div>
                    <p className="font-medium">{prediction.routeName}</p>
                    <p className="text-sm text-muted-foreground">
                      To {prediction.headsign}
                    </p>
                  </div>
                </div>

                {/* Arrival time */}
                <div className="text-right">
                  <Badge
                    variant={
                      prediction.secondsToArrival < 120
                        ? 'error'
                        : prediction.secondsToArrival < 300
                        ? 'warning'
                        : 'default'
                    }
                    className="flex items-center space-x-1"
                  >
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(prediction.secondsToArrival)}</span>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StopBoard;
