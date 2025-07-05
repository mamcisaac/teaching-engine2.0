import React, { Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../components/MainLayout';
import WorkflowGate from '../components/WorkflowGate';
import { publicRoutes, protectedRoutes, RouteConfig } from './routesConfig';

// Common suspense fallback
const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function renderRoute(route: RouteConfig, index: number): JSX.Element {
  const { path, element: Element, workflowLevel, children, index: isIndex } = route;

  let content: React.ReactNode;

  if (typeof Element === 'function') {
    // This is a component (including lazy components)
    content = (
      <Suspense fallback={<SuspenseFallback />}>
        {workflowLevel ? (
          <WorkflowGate level={workflowLevel}>
            <Element />
          </WorkflowGate>
        ) : (
          <Element />
        )}
      </Suspense>
    );
  } else if (React.isValidElement(Element)) {
    // This is a JSX element (like <Navigate />)
    content = Element;
  } else {
    // This shouldn't happen, but fallback
    content = Element;
  }

  if (children) {
    return (
      <Route key={path || index} path={path} element={<Outlet />}>
        {children.map((child, childIndex) => renderRoute(child, childIndex))}
      </Route>
    );
  }

  return <Route key={path || index} path={path} index={isIndex} element={content} />;
}

export function AppRouter() {
  const { isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return <SuspenseFallback />;
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
