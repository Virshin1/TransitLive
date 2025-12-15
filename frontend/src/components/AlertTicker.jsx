/**
 * Alert Ticker Component
 * Horizontal scrolling ticker showing active service alerts
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, AlertTriangle, Clock, Wrench } from 'lucide-react';
import apiService from '../services/api';
import socketService from '../services/socket';
import { Badge } from './ui/badge';

function AlertTicker() {
  const [alerts, setAlerts] = useState([]);

  // Load active alerts from API
  const loadAlerts = useCallback(async () => {
    try {
      const response = await apiService.getActiveAlerts();
      setAlerts(response.data);
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  }, []);

  // Set up WebSocket to receive real-time alert updates
  const setupWebSocket = useCallback(() => {
    socketService.connect();

    const handleNewAlert = (alert) => {
      // Add or update alert in the list
      setAlerts(prev => {
        const exists = prev.find(a => a._id === alert._id);
        if (exists) {
          return prev.map(a => a._id === alert._id ? alert : a);
        }
        return [...prev, alert];
      });
    };

    // Listen for service alerts from WebSocket
    socketService.onServiceAlerts(handleNewAlert);

    return () => {
      socketService.off('service_alerts', handleNewAlert);
    };
  }, []);

  useEffect(() => {
    loadAlerts();
    setupWebSocket();
  }, [loadAlerts, setupWebSocket]);

  // Don't show ticker if no alerts
  if (alerts.length === 0) return null;

  // Determine how many times to duplicate based on alert count
  const duplicateCount = alerts.length <= 3 ? 4 : 2;

  // Helper to get icon based on alert type
  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'delay':
        return Clock;
      case 'maintenance':
        return Wrench;
      case 'disruption':
        return AlertTriangle;
      default:
        return AlertCircle;
    }
  };

  // Helper to get severity color classes
  const getSeverityClasses = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-900',
          badgeBg: 'bg-red-200',
          badgeText: 'text-red-900'
        };
      case 'warning':
        return {
          bg: 'bg-amber-100',
          border: 'border-amber-300',
          text: 'text-amber-900',
          badgeBg: 'bg-amber-200',
          badgeText: 'text-amber-900'
        };
      default:
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-900',
          badgeBg: 'bg-blue-200',
          badgeText: 'text-blue-900'
        };
    }
  };

  return (
    <div className="border-b bg-white py-3 overflow-hidden">
      <div className="relative flex overflow-hidden">
        <div className="animate-marquee gap-3">
            {/* Render alert sets based on duplicateCount */}
            {Array.from({ length: duplicateCount }).map((_, setIndex) => (
              <div key={`set-${setIndex}`} className="flex items-center gap-3">
                {alerts.map((alert) => {
                  const Icon = getAlertIcon(alert.alertType);
                  const colors = getSeverityClasses(alert.severity);
                  
                  return (
                    <div
                      key={`${alert._id}-${setIndex}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors.bg} ${colors.border} flex-shrink-0 whitespace-nowrap`}
                    >
                      <Icon className={`h-4 w-4 ${colors.text}`} />
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${colors.badgeBg} ${colors.badgeText} border-0`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className={`text-xs font-medium uppercase ${colors.badgeText}`}>
                          {alert.alertType}
                        </span>
                        <span className={`text-sm font-semibold ${colors.text}`}>
                          {alert.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}

export default AlertTicker;
