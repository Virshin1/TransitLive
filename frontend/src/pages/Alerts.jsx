/**
 * Alerts Page
 * Shows all service alerts with filtering options
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import apiService from '../services/api';
import socketService from '../services/socket';

function Alerts() {
  // State management
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, inactive

  // Load alerts based on selected filter
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'active') params.active = true;
      if (filter === 'inactive') params.active = false;

      const response = await apiService.getAllAlerts(params);
      setAlerts(response.data);
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Set up WebSocket for real-time alert updates
  const setupWebSocket = useCallback(() => {
    socketService.connect();

    const handleNewAlert = (alert) => {
      setAlerts(prev => {
        const exists = prev.find(a => a._id === alert._id);
        if (exists) {
          // Update existing alert
          return prev.map(a => a._id === alert._id ? alert : a);
        }
        // Add new alert at the beginning
        return [alert, ...prev];
      });
    };

    socketService.onServiceAlerts(handleNewAlert);

    return () => {
      socketService.off('service_alerts', handleNewAlert);
    };
  }, []);

  useEffect(() => {
    loadAlerts();
    setupWebSocket();
  }, [loadAlerts, setupWebSocket]);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get icon based on severity
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  // Get badge variant based on severity
  const getSeverityVariant = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'default';
      default:
        return 'secondary';
    }
  };

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

        {/* Page header with filters */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Service Alerts</h1>
            <p className="mt-1 text-muted-foreground">
              Stay informed about transit service updates
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('inactive')}
            >
              Resolved
            </Button>
          </div>
        </div>

        {/* Alerts list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No alerts found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <Card key={alert._id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      {/* Severity icon */}
                      <div className={`mt-1 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'warning' ? 'text-amber-600' :
                        'text-blue-600'
                      }`}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="mb-2">{alert.title}</CardTitle>
                        {/* Alert badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getSeverityVariant(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary">
                            {alert.alertType}
                          </Badge>
                          <Badge variant={alert.isActive ? 'success' : 'secondary'}>
                            {alert.isActive ? 'ACTIVE' : 'RESOLVED'}
                          </Badge>
                          {/* Show UPDATED badge if alert has been modified */}
                          {alert.updateCount > 0 && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              UPDATED {alert.updateCount}x
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Alert description */}
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    {alert.description}
                  </p>

                  {/* Affected routes */}
                  {alert.affectedRoutes && alert.affectedRoutes.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-semibold">Affected Routes:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.affectedRoutes.map(route => (
                          <Badge key={route._id} variant="outline">
                            {route.routeName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alert metadata */}
                  <div className="mt-4 space-y-1 border-t pt-4 text-sm text-muted-foreground">
                    <div>Started: {formatDate(alert.startTime)}</div>
                    {alert.updatedAt && alert.createdAt !== alert.updatedAt && (
                      <div className="text-blue-600 font-medium">
                        Last Updated: {formatDate(alert.updatedAt)}
                      </div>
                    )}
                    {alert.endTime && (
                      <div>
                        {alert.isActive ? 'Expires' : 'Ended'}: {formatDate(alert.endTime)}
                      </div>
                    )}
                    <div className="text-xs">Alert ID: {alert.alertId}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;
