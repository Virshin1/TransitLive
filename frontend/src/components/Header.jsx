/**
 * Header Component
 * Navigation bar with links to different pages
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Train, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

function Header() {
  // Get current route to highlight active navigation item
  const location = useLocation();

  // Don't show header on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and brand name */}
        <Link to="/" className="flex items-center space-x-2">
          <Train className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">TransitLive</span>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center space-x-6">
          <Link
            to="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Dashboard
          </Link>
          <Link
            to="/alerts"
            className={cn(
              "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/alerts"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <AlertCircle className="h-4 w-4" />
            <span>Alerts</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
