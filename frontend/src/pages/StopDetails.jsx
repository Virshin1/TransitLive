/**
 * Stop Details Page
 * Shows detailed information and real-time arrivals for a specific stop
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import apiService from '../services/api';
import socketService from '../services/socket';




// Helper to get transit icon based on route type
const getTransitIcon = (routeType) => {
  const type = (routeType || 'bus').toLowerCase();
  const iconPath = `/icons/${type}.svg`;
  
  return (
    <img 
      src={iconPath} 
      alt={routeType} 
      className="h-10 w-10"
      style={{ filter: 'brightness(0) invert(1)' }}
      onError={(e) => {
        e.target.src = '/icons/bus.svg'; // Fallback to bus icon
      }}
    />
  );
};

function StopDetails() {
  // Get stop ID from URL parameters
  const { id } = useParams();
  
  // State management
  const [stop, setStop] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load stop data and predictions
  const loadStopData = useCallback(async () => {
    try {
      setLoading(true);
      const [stopResponse, predictionsResponse] = await Promise.all([
        apiService.getStop(id),
        apiService.getStopPredictions(id)
      ]);
      setStop(stopResponse.data);
      setPredictions(predictionsResponse.data || []);
    } catch (err) {
      console.error('Error loading stop:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Set up WebSocket connection for real-time arrival updates
  const setupRealtimeUpdates = useCallback(() => {
    socketService.connect();
    socketService.subscribeToStop(id);

    const handleArrivals = (updates) => {
      // Filter predictions for this stop and calculate seconds until arrival
      const stopPredictions = updates
        .filter(update => update.stopId.toString() === id)
        .map(update => {
          // Handle cancelled predictions
          if (update.status === 'cancelled' || !update.predictedArrival) {
            return {
              ...update,
              secondsUntilArrival: 0
            };
          }
          
          const now = new Date();
          const arrivalTime = new Date(update.predictedArrival);
          const secondsUntilArrival = Math.max(0, Math.floor((arrivalTime - now) / 1000));
          return {
            ...update,
            secondsUntilArrival
          };
        })
        .sort((a, b) => a.secondsUntilArrival - b.secondsUntilArrival);
      
      if (stopPredictions.length > 0) {
        setPredictions(stopPredictions);
      }
    };

    socketService.onArrivalUpdates(handleArrivals);

    return () => {
      socketService.unsubscribeFromStop(id);
      socketService.off('arrival_updates', handleArrivals);
    };
  }, [id]);

  useEffect(() => {
    loadStopData();
    setupRealtimeUpdates();
  }, [loadStopData, setupRealtimeUpdates]);

  // Helper to format arrival time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return 'Arriving';
    if (minutes === 1) return '1 min';
    return `${minutes} mins`;
  };

  // Get badge variant based on arrival time
  const getTimeVariant = (seconds) => {
    if (seconds < 120) return 'error';
    if (seconds < 300) return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Stop not found</p>
          <Link to="/" className="mt-4 inline-block">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/" className="mb-6 inline-block">
          <Button variant="ghost" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>

        {/* Stop information card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{stop.stopName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Stop ID: {stop.stopId}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          {stop.stopDesc && (
            <CardContent>
              <p className="text-muted-foreground">{stop.stopDesc}</p>
            </CardContent>
          )}
        </Card>

        {/* Real-time arrivals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Real-Time Arrivals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No upcoming arrivals
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.map((prediction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border bg-white p-4 transition-all hover:shadow-md"
                  >
                    {/* Route information */}
                    <div className="flex items-center space-x-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: prediction.color || '#2c3e50',
                        }}
                      >
                        {getTransitIcon(prediction.routeType)}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {prediction.routeName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {prediction.routeType || 'Transit'} • Vehicle {prediction.vehicleId}
                        </p>
                        {prediction.status === 'delayed' && (
                          <p className="text-xs text-amber-600 font-medium">
                            Delayed {prediction.delay} min
                          </p>
                        )}
                        {prediction.status === 'cancelled' && (
                          <p className="text-xs text-red-600 font-medium">
                            Cancelled
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Arrival time badge */}
                    {prediction.status === 'cancelled' ? (
                      <Badge variant="destructive" className="px-4 py-2 text-base">
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge
                        variant={getTimeVariant(prediction.secondsUntilArrival)}
                        className="px-4 py-2 text-base"
                      >
                        {formatTime(prediction.secondsUntilArrival)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default StopDetails;
