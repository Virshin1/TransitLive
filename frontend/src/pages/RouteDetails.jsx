/**
 * Route Details Page
 * Shows detailed information about a specific route and its stops
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle,  } from 'lucide-react';
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
      className="h-12 w-12"
      style={{ filter: 'brightness(0) invert(1)' }}
      onError={(e) => {
        e.target.src = '/icons/bus.svg'; // Fallback to bus icon
      }}
    />
  );
};

function RouteDetails() {
  // Get route ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [route, setRoute] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [vehiclePosition, setVehiclePosition] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load route data
  const loadRouteData = useCallback(async () => {
    try {
      setLoading(true);
      const [routeResponse, alertsResponse, vehicleResponse] = await Promise.all([
        apiService.getRoute(id),
        apiService.getActiveAlerts(),
        apiService.getRouteVehiclePosition(id)
      ]);
      setRoute(routeResponse.data);
      
      // Filter alerts for this route
      const routeAlerts = alertsResponse.data.filter(alert => 
        alert.affectedRoutes?.some(r => r._id === id || r === id)
      );
      setAlerts(routeAlerts);
      setVehiclePosition(vehicleResponse.data);
    } catch (err) {
      console.error('Error loading route:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Set up WebSocket for real-time alert updates
  const setupRealtimeUpdates = useCallback(() => {
    socketService.connect();

    const handleAlerts = (alert) => {
      if (alert.affectedRoutes?.some(r => r._id === id || r === id)) {
        setAlerts(prev => {
          const exists = prev.find(a => a._id === alert._id);
          if (alert.isActive) {
            if (exists) {
              return prev.map(a => a._id === alert._id ? alert : a);
            }
            return [...prev, alert];
          } else {
            return prev.filter(a => a._id !== alert._id);
          }
        });
      }
    };

    // Update vehicle position from arrival updates
    const handleArrivalUpdates = async (updates) => {
      const routeUpdates = updates.filter(u => u.routeId.toString() === id);
      if (routeUpdates.length > 0) {
        try {
          const response = await apiService.getRouteVehiclePosition(id);
          setVehiclePosition(response.data);
        } catch (err) {
          console.error('Error updating vehicle position:', err);
        }
      }
    };

    socketService.onServiceAlerts(handleAlerts);
    socketService.onArrivalUpdates(handleArrivalUpdates);

    return () => {
      socketService.off('service_alerts', handleAlerts);
      socketService.off('arrival_updates', handleArrivalUpdates);
    };
  }, [id]);

  useEffect(() => {
    loadRouteData();
    setupRealtimeUpdates();
  }, [loadRouteData, setupRealtimeUpdates]);

  // Get alert severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-300';
      case 'warning':
        return 'text-amber-600 bg-amber-100 border-amber-300';
      default:
        return 'text-blue-600 bg-blue-100 border-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Route not found</p>
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

        {/* Route information card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="flex h-16 w-16 items-center justify-center rounded-lg"
                  style={{ backgroundColor: route.routeColor || '#2c3e50' }}
                >
                  {getTransitIcon(route.routeType)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{route.routeName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Route {route.routeId}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {route.routeType || 'Bus'}
              </Badge>
            </div>
          </CardHeader>
          {route.routeDesc && (
            <CardContent>
              <p className="text-muted-foreground">{route.routeDesc}</p>
            </CardContent>
          )}
        </Card>

        {/* Service alerts for this route */}
        {alerts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>Service Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.alertType.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <h4 className="font-semibold mb-1">{alert.title}</h4>
                    <p className="text-sm">{alert.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stops along this route */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Stops on This Route</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!route.stops || route.stops.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No stops available
              </div>
            ) : (
              <div className="space-y-3">
                {route.stops.map((stop, index) => {
                  const stopStatus = vehiclePosition?.stopStatuses?.find(
                    s => s.stopId === stop._id.toString()
                  );
                  const isVisited = stopStatus?.visited || false;
                  const isCurrent = vehiclePosition?.vehicle?.currentStopIndex === index;
                  
                  return (
                    <div
                      key={stop._id}
                      className={`flex items-center justify-between rounded-lg border p-4 transition-all cursor-pointer ${
                        isVisited 
                          ? 'bg-gray-50 border-gray-200 opacity-60' 
                          : isCurrent
                          ? 'bg-blue-50 border-blue-300 hover:shadow-lg'
                          : 'bg-white hover:shadow-md'
                      }`}
                      onClick={() => navigate(`/stop/${stop._id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                          isVisited 
                            ? 'bg-green-500 text-white' 
                            : isCurrent
                            ? 'bg-blue-500 text-white'
                            : 'bg-primary text-white'
                        }`}>
                          {isVisited ? '✓' : index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${isVisited ? 'line-through text-gray-500' : ''}`}>
                              {stop.stopName}
                            </p>
                            {isCurrent && (
                              <Badge className="bg-blue-500 text-white">
                                Current Stop
                              </Badge>
                            )}
                            {isVisited && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Visited
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Stop ID: {stop.stopId}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Arrivals →
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RouteDetails;
