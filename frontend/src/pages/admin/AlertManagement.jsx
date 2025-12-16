/**
 * Alert Management Page
 * Create and edit service alerts
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Save, Trash2, AlertCircle, FileText, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import apiService from '../../services/api';

function AlertManagement() {
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'info',
    alertType: 'general',
    affectedRoutes: [],
    startTime: '',
    endTime: '',
    isActive: true
  });

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadOptions();
    if (isEditMode) {
      loadAlert();
    }
  }, [id]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const loadOptions = async () => {
    try {
      const routesRes = await apiService.getAllRoutes();
      setRoutes(routesRes.data);
    } catch (err) {
      console.error('Error loading routes:', err);
    }
  };

  const loadAlert = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAlert(id);
      const alert = response.data;
      
      setFormData({
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        alertType: alert.alertType,
        affectedRoutes: alert.affectedRoutes?.map(r => r._id) || [],
        startTime: alert.startTime ? new Date(alert.startTime).toISOString().slice(0, 16) : '',
        endTime: alert.endTime ? new Date(alert.endTime).toISOString().slice(0, 16) : '',
        isActive: alert.isActive
      });
    } catch (err) {
      setError('Failed to load alert');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined
      };

      if (isEditMode) {
        await apiService.updateAlert(id, payload, token);
        setSuccess('Alert updated successfully!');
      } else {
        await apiService.createAlert(payload, token);
        setSuccess('Alert created successfully!');
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await apiService.deleteAlert(id, token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to delete alert');
      setLoading(false);
    }
  };

  const handleRouteToggle = (routeId) => {
    setFormData(prev => ({
      ...prev,
      affectedRoutes: prev.affectedRoutes.includes(routeId)
        ? prev.affectedRoutes.filter(id => id !== routeId)
        : [...prev.affectedRoutes, routeId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-700 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-8 w-px bg-white/20" />
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Alert' : 'Create New Alert'}
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert Details Section */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                <CardTitle>Alert Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  Alert Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Disruption on Metro Line 2"
                />
                <p className="text-xs text-gray-500">Brief, clear summary visible to all passengers</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about the service disruption, expected duration, and alternative options..."
                />
                <p className="text-xs text-gray-500">Detailed explanation to help passengers plan accordingly</p>
              </div>

              {/* Severity and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="severity" className="text-sm font-semibold text-gray-700">
                    Severity Level
                  </label>
                  <select
                    id="severity"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all appearance-none bg-white"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  >
                    <option value="info">Info - Minor updates</option>
                    <option value="warning">Warning - Moderate impact</option>
                    <option value="critical">Critical - Major disruption</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="alertType" className="text-sm font-semibold text-gray-700">
                    Alert Type
                  </label>
                  <select
                    id="alertType"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all appearance-none bg-white"
                    value={formData.alertType}
                    onChange={(e) => setFormData({ ...formData, alertType: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="delay">Delay</option>
                    <option value="cancellation">Cancellation</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disruption">Disruption</option>
                  </select>
                </div>
              </div>

              {/* Time range */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span>Time Range (Optional)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <label htmlFor="startTime" className="text-sm text-gray-600">
                      Start Time
                    </label>
                    <input
                      id="startTime"
                      type="datetime-local"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="endTime" className="text-sm text-gray-600">
                      End Time
                    </label>
                    <input
                      id="endTime"
                      type="datetime-local"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Active status */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="h-5 w-5 rounded border-gray-300 text-slate-600 focus:ring-slate-500 cursor-pointer"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Alert is active and will be visible to passengers
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affected Routes Section */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-600" />
                  <CardTitle>Affected Routes</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formData.affectedRoutes.length} selected
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">Select routes impacted by this alert (optional)</p>
            </CardHeader>
            <CardContent className="pt-6">
              {routes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No routes available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {routes.map((route) => {
                    const isSelected = formData.affectedRoutes.includes(route._id);
                    return (
                      <div
                        key={route._id}
                        onClick={() => handleRouteToggle(route._id)}
                        className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-slate-600 bg-slate-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-bold text-sm text-gray-900">{route.routeName}</div>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-slate-600 flex-shrink-0" />
                          )}
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs capitalize"
                        >
                          {route.routeType}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="shadow-sm bg-white sticky bottom-0 z-10">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  {isEditMode && (
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:text-red-700 hover:bg-red-50 hover:border-red-400"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Alert
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Link to="/admin/dashboard">
                    <Button type="button" variant="outline" size="lg">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    size="lg"
                    className="bg-slate-700 hover:bg-slate-800"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Alert'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default AlertManagement;
