/**
 * Admin Dashboard
 * Overview of system status and quick actions
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AlertCircle, AlertTriangle, Info, Plus, LogOut, Home, TrendingUp, MapPin, Bell } from 'lucide-react';
import apiService from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRoutes: 0,
    totalStops: 0,
    activeAlerts: 0,
    criticalAlerts: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadDashboardData = async () => {
    try {
      const [routesRes, stopsRes, alertsRes] = await Promise.all([
        apiService.getAllRoutes(),
        apiService.getAllStops(),
        apiService.getActiveAlerts()
      ]);

      setStats({
        totalRoutes: routesRes.data.length,
        totalStops: stopsRes.data.length,
        activeAlerts: alertsRes.data.length,
        criticalAlerts: alertsRes.data.filter(a => a.severity === 'critical').length
      });

      setRecentAlerts(alertsRes.data.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

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
      {/* Admin header */}
      <header className="bg-slate-700 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">TransitLive Admin</h1>
                  <p className="text-xs text-slate-200">Control Panel</p>
                </div>
              </div>
              <Badge className="bg-white/10 text-white border-white/20">
                Administrator
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Routes
                </CardTitle>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalRoutes}</div>
              <p className="text-xs text-gray-500 mt-1">Active transit routes</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Stops
                </CardTitle>
                <div className="bg-green-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalStops}</div>
              <p className="text-xs text-gray-500 mt-1">Transit stations</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Alerts
                </CardTitle>
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.activeAlerts}</div>
              <p className="text-xs text-gray-500 mt-1">Current service alerts</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Critical Alerts
                </CardTitle>
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.criticalAlerts}</div>
              <p className="text-xs text-gray-500 mt-1">Requiring immediate attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link to="/admin/alerts/new">
            <Button size="lg" className="bg-slate-700 hover:bg-slate-800 w-full sm:w-auto">
              <Bell className="h-5 w-5 mr-2" />
              Create New Alert
            </Button>
          </Link>
        </div>

        {/* Recent Alerts */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Alerts</CardTitle>
              <Link to="/admin/alerts">
                <Button variant="link" size="sm" className="text-slate-600">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">{recentAlerts.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No active alerts</p>
                  <p className="text-sm text-gray-500 mt-1">Create your first alert to notify passengers</p>
                </div>
              ) : (
                recentAlerts.map((alert) => (
                  <Card key={alert._id} className="hover:shadow-md transition-shadow border">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2.5 rounded-lg ${getSeverityColor(alert.severity)}`}>
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 leading-tight">{alert.title}</h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{alert.description}</p>
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
                          <Button variant="outline" size="sm" className="flex-shrink-0">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
