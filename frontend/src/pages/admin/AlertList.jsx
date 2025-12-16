/**
 * Alert List Page
 * View and manage all alerts
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Plus, Edit, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import apiService from '../../services/api';

function AlertList() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadAlerts();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await apiService.getAllAlerts();
      setAlerts(response.data);
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return alert.isActive;
    if (filter === 'inactive') return !alert.isActive;
    return true;
  });

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-700 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-8 w-px bg-white/20" />
              <h1 className="text-2xl font-bold text-white">Manage Alerts</h1>
            </div>
            <Link to="/admin/alerts/new">
              <Button className="bg-white text-slate-700 hover:bg-slate-100">
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({alerts.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active ({alerts.filter(a => a.isActive).length})
          </Button>
          <Button
            variant={filter === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('inactive')}
          >
            Inactive ({alerts.filter(a => !a.isActive).length})
          </Button>
        </div>

        {/* Alerts list */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No alerts found</p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card key={alert._id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-md ${getSeverityColor(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                          {!alert.isActive && (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span className="capitalize">Type: {alert.alertType}</span>
                          {alert.startTime && (
                            <span>
                              Start: {new Date(alert.startTime).toLocaleString()}
                            </span>
                          )}
                          {alert.endTime && (
                            <span>
                              End: {new Date(alert.endTime).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Affected routes */}
                        {alert.affectedRoutes && alert.affectedRoutes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {alert.affectedRoutes.map((route) => (
                              <Badge key={route._id} variant="outline" className="text-xs">
                                {route.routeName}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Link to={`/admin/alerts/${alert._id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertList;
