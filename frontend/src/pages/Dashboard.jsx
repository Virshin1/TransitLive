/**
 * Dashboard Page
 * Main page showing all routes and quick access to stops
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import apiService from '../services/api';
import socketService from '../services/socket';
import RouteList from '../components/RouteList';
import AlertTicker from '../components/AlertTicker';

function Dashboard() {
  // State management
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    setupAlertUpdates();
  }, []);

  // Load routes, stops, and alerts from API
  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch routes, stops, and alerts in parallel for better performance
      const [routesRes, stopsRes, alertsRes] = await Promise.all([
        apiService.getAllRoutes(),
        apiService.getAllStops(),
        apiService.getActiveAlerts()
      ]);
      setRoutes(routesRes.data);
      setStops(stopsRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Set up WebSocket for real-time alert updates
  const setupAlertUpdates = () => {
    socketService.connect();

    const handleAlertUpdate = (alert) => {
      setAlerts(prev => {
        const exists = prev.find(a => a._id === alert._id);
        if (alert.isActive) {
          if (exists) {
            return prev.map(a => a._id === alert._id ? alert : a);
          }
          return [...prev, alert];
        } else {
          // Remove inactive alerts
          return prev.filter(a => a._id !== alert._id);
        }
      });
    };

    socketService.onServiceAlerts(handleAlertUpdate);

    return () => {
      socketService.off('service_alerts', handleAlertUpdate);
    };
  };

  // Filter stops based on search term
  const filteredStops = stops.filter(stop =>
    stop.stopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stop.stopId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert ticker at the top */}
      <AlertTicker />

      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Transit Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Real-time transit information and arrival predictions
          </p>
        </div>

        {/* Routes section */}
        <div className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">All Routes</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <RouteList
              routes={routes}
              alerts={alerts}
              onRouteClick={(route) => {
                // Navigate to route details page
                navigate(`/route/${route._id}`);
              }}
            />
          )}
        </div>

        {/* Quick stop search section */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Find a Stop</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by stop name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-input bg-white px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Stop search results */}
          {searchTerm && (
            <div className="rounded-lg border bg-white shadow-sm">
              {filteredStops.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No stops found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStops.slice(0, 10).map((stop) => (
                    <button
                      key={stop._id}
                      onClick={() => navigate(`/stop/${stop._id}`)}
                      className="w-full px-4 py-3 text-left transition-colors hover:bg-accent"
                    >
                      <p className="font-medium">{stop.stopName}</p>
                      <p className="text-sm text-muted-foreground">
                        Stop ID: {stop.stopId}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
