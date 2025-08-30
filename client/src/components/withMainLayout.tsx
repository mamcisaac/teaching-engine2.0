import React from 'react';
import { MainLayout } from './MainLayout';

/**
 * Higher-order component to wrap pages with MainLayout
 */
export function withMainLayout<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    return (
      <MainLayout>
        <Component {...props} />
      </MainLayout>
    );
  };

  WrappedComponent.displayName = `withMainLayout(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}