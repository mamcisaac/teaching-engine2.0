
import React, { Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import { MainLayout } from '../components/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { WorkflowGate } from '../components/WorkflowGate';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';

import type { RouteConfig } from './routesConfig';
import { publicRoutes, protectedRoutes } from './routesConfig';

// Common suspense fallback
const SuspenseFallback = (): JSX.Element => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

function renderRoute(route: RouteConfig, index: number): JSX.Element {
  const { path, element: Element, workflowLevel, children, index: isIndex } = route;

  let content: React.ReactNode;

  if (React.isValidElement(Element)) {
    // This is already a JSX element (like <Navigate />)
    content = Element;
  } else if (Element) {
    // This is a component (including lazy components)
    // We need to check if it's a lazy component by looking at its type
    const Component = Element as React.ComponentType;

    content = (
      <Suspense fallback={<SuspenseFallback />}>
        {(workflowLevel !== null) ? (
          <WorkflowGate level={workflowLevel}>
            <Component />
          </WorkflowGate>
        ) : (
          <Component />
        )}
      </Suspense>
    );
  } else {
    // No element provided
    content = null;
  }

  if (children !== null && children.length > 0) {
    return (
      <Route key={(path !== null && path !== undefined && path !== '') ? path : index} element={<Outlet />} path={path}>
        {children.map((child, childIndex) => renderRoute(child, childIndex))}
      </Route>
    );
  }

  return <Route key={(path !== null && path !== undefined && path !== '') ? path : index} element={content} index={isIndex} path={path} />;
}

export function AppRouter(): JSX.Element {
  const { isLoading, isInitialized, error } = useAuth();

  // Add debug logging
  logger.debug('[AppRouter] Auth state:', { isLoading, isInitialized, error });

  // Show loading spinner only during initial auth check
  // But add a timeout to prevent infinite loading
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <SuspenseFallback />
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes.map((route, index) => renderRoute(route, index))}

      {/* Protected routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout>
              <Outlet />
            </MainLayout>
          </ProtectedRoute>
        }
      >
        {protectedRoutes.map((route, index) => renderRoute(route, index))}
      </Route>
    </Routes>
  );
}
