/**
 * Main App Component
 * Sets up routing and layout with modern structure
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ConnectionStatus from './components/ConnectionStatus';
import Dashboard from './pages/Dashboard';
import RouteDetails from './pages/RouteDetails';
import StopDetails from './pages/StopDetails';
import Alerts from './pages/Alerts';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AlertManagement from './pages/admin/AlertManagement';
import AlertList from './pages/admin/AlertList';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navigation header - sticky at top */}
        <Header />
        
        {/* Main content area */}
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/route/:id" element={<RouteDetails />} />
            <Route path="/stop/:id" element={<StopDetails />} />
            <Route path="/alerts" element={<Alerts />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/alerts" element={<AlertList />} />
            <Route path="/admin/alerts/new" element={<AlertManagement />} />
            <Route path="/admin/alerts/:id" element={<AlertManagement />} />
          </Routes>
        </main>

        {/* WebSocket connection status indicator */}
        <ConnectionStatus />
      </div>
    </Router>
  );
}

export default App;
