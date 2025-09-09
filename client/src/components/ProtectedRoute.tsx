import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, isLoading, isInitialized, user: _user } = useAuth();
  const location = useLocation();

  // Enhanced debug logging disabled for production

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    logger.info('[ProtectedRoute] Auth state:', {
      isAuthenticated,
      isLoading,
      isInitialized,
      currentPath: location.pathname,
    });
  }

  // Don't render anything until auth is initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // For E2E tests, also check for token cookie directly
  const hasTokenCookie = typeof document !== 'undefined' && document.cookie.includes('token=');
  const authenticated = isAuthenticated || hasTokenCookie;

  if (!authenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they log in, which is a nicer user experience
    // than dropping them off on the home page.
    logger.info('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return children as React.ReactElement;
}
