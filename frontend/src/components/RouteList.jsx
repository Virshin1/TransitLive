/**
 * Route List Component
 * Displays a grid of transit routes with real-time status
 */

import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

// Helper to get transit icon based on route type
const getTransitIcon = (routeType) => {
  const type = (routeType || 'bus').toLowerCase();
  const iconPath = `/icons/${type}.svg`;
  
  return (
    <img 
      src={iconPath} 
      alt={routeType} 
      className="h-7 w-7"
      onError={(e) => {
        e.target.src = '/icons/bus.svg'; // Fallback to bus icon
      }}
    />
  );
};

function RouteList({ routes, alerts = [], onRouteClick }) {
  // Show loading state if no routes provided
  if (!routes || routes.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No routes available
      </div>
    );
  }

  // Helper to get alerts for a specific route
  const getRouteAlerts = (routeId) => {
    return alerts.filter(alert => 
      alert.isActive && 
      alert.affectedRoutes?.some(r => r._id === routeId || r === routeId)
    );
  };

  // Helper to get the most severe alert for a route
  const getMostSevereAlert = (routeAlerts) => {
    if (routeAlerts.length === 0) return null;
    
    const severityOrder = { critical: 3, warning: 2, info: 1 };
    return routeAlerts.reduce((prev, current) => 
      (severityOrder[current.severity] || 0) > (severityOrder[prev.severity] || 0) ? current : prev
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {routes.map((route) => {
        const routeAlerts = getRouteAlerts(route._id);
        const severeAlert = getMostSevereAlert(routeAlerts);
        const hasDelays = routeAlerts.some(a => a.alertType === 'delay');

        return (
          <Card
            key={route._id}
            className="cursor-pointer transition-all hover:shadow-md h-full"
            onClick={() => onRouteClick && onRouteClick(route)}
          >
            <CardContent className="p-4 h-full flex flex-col">
              {/* Route header with icon and name */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: route.routeColor || '#ffffffff',
                    }}
                  >
                    {getTransitIcon(route.routeType)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{route.routeName}</h3>
                    <p className="text-xs text-muted-foreground">
                      Route {route.routeId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delay/Alert badges */}
              <div className="mb-3 min-h-[44px]">
                {routeAlerts.length > 0 && (
                  <div className="space-y-1">
                    {hasDelays && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 text-amber-600" />
                        <span className="font-medium text-amber-600">Running Late</span>
                      </div>
                    )}
                    {severeAlert && (
                      <Badge 
                        variant={
                          severeAlert.severity === 'critical' ? 'error' :
                          severeAlert.severity === 'warning' ? 'warning' : 'default'
                        }
                        className="text-xs"
                      >
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {severeAlert.alertType.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Route description */}
              {route.routeDesc && (
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {route.routeDesc}
                </p>
              )}

              {/* Route type badge and status */}
              <div className="flex items-center justify-between mt-auto">
                <Badge variant="secondary" className="text-xs">
                  {route.routeType || 'Bus'}
                </Badge>
                {/* Active status indicator */}
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  route.isActive ? "bg-green-500" : "bg-gray-300"
                )} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default RouteList;
