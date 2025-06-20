/**
 * Analytics Widget Integration System
 *
 * Provides a flexible widget system that allows other agents to embed
 * analytics components into their dashboards and interfaces.
 */

import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Lazy load analytics components for better performance
const CurriculumHeatmap = React.lazy(() => import('./CurriculumHeatmap'));
const DomainRadarChart = React.lazy(() => import('./DomainRadarChart'));
const ThemeAnalyticsDashboard = React.lazy(() => import('./ThemeAnalyticsDashboard'));
const VocabularyGrowthDashboard = React.lazy(() => import('./VocabularyGrowthDashboard'));

// Widget types that other agents can request
export type AnalyticsWidgetType =
  | 'curriculum-heatmap'
  | 'domain-radar'
  | 'theme-analytics'
  | 'vocabulary-growth'
  | 'mini-curriculum-summary'
  | 'mini-domain-overview'
  | 'mini-vocabulary-stats';

// Common widget configuration
export interface AnalyticsWidgetConfig {
  type: AnalyticsWidgetType;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  showExport?: boolean;
  showTitle?: boolean;
  className?: string;
  // Widget-specific props
  [key: string]: any;
}

// Widget size configurations
const WIDGET_SIZES = {
  small: 'w-64 h-48',
  medium: 'w-96 h-64',
  large: 'w-full h-96',
  full: 'w-full h-full',
};

// Loading skeleton component
const WidgetSkeleton: React.FC<{ size: string; title?: string }> = ({ size, title }) => (
  <div className={`${size} p-4 bg-white rounded-lg shadow border border-gray-200`}>
    {title && (
      <div className="mb-3">
        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    )}
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Error boundary for widget failures
class AnalyticsWidgetErrorBoundary extends React.Component<
  { children: React.ReactNode; widgetType: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; widgetType: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Analytics widget error (${this.props.widgetType}):`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <div>
              <p className="text-red-800 font-medium">Analytics Widget Error</p>
              <p className="text-red-600 text-sm">
                Failed to load {this.props.widgetType} widget. Please try again later.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main Analytics Widget Component
export const AnalyticsWidget: React.FC<AnalyticsWidgetConfig> = ({
  type,
  title,
  size = 'medium',
  showExport = false,
  showTitle = true,
  className = '',
  ...props
}) => {
  const sizeClass = WIDGET_SIZES[size];
  const widgetTitle = title || getDefaultTitle(type);

  // Create a dedicated query client for the widget to avoid conflicts
  const queryClient = React.useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
          },
        },
      }),
    [],
  );

  const renderWidget = () => {
    switch (type) {
      case 'curriculum-heatmap':
        return <CurriculumHeatmap className="h-full" {...props} />;

      case 'domain-radar':
        return <DomainRadarChart className="h-full" studentId={1} {...props} />;

      case 'theme-analytics':
        return <ThemeAnalyticsDashboard className="h-full" {...props} />;

      case 'vocabulary-growth':
        return <VocabularyGrowthDashboard className="h-full" studentId={1} {...props} />;

      case 'mini-curriculum-summary':
        return <MiniCurriculumSummary {...props} />;

      case 'mini-domain-overview':
        return <MiniDomainOverview {...props} />;

      case 'mini-vocabulary-stats':
        return <MiniVocabularyStats {...props} />;

      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">Unknown widget type: {type}</p>
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsWidgetErrorBoundary widgetType={type}>
        <div className={`${sizeClass} ${className}`}>
          <div className="h-full flex flex-col">
            {showTitle && (
              <div className="flex-shrink-0 mb-3 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{widgetTitle}</h3>
                {showExport && (
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Export</button>
                )}
              </div>
            )}
            <div className="flex-grow min-h-0">
              <Suspense
                fallback={
                  <WidgetSkeleton
                    size="w-full h-full"
                    title={showTitle ? widgetTitle : undefined}
                  />
                }
              >
                {renderWidget()}
              </Suspense>
            </div>
          </div>
        </div>
      </AnalyticsWidgetErrorBoundary>
    </QueryClientProvider>
  );
};

// Mini widget components for dashboard integration
const MiniCurriculumSummary: React.FC<any> = ({ teacherId, subject }) => {
  // This would use a simplified API call for summary data
  return (
    <div className="p-3 bg-blue-50 rounded-lg">
      <div className="text-2xl font-bold text-blue-600">87%</div>
      <div className="text-sm text-blue-700">Curriculum Coverage</div>
      <div className="text-xs text-gray-600 mt-1">{subject || 'All Subjects'}</div>
    </div>
  );
};

const MiniDomainOverview: React.FC<{ studentId?: number }> = ({ studentId }) => {
  return (
    <div className="p-3 bg-green-50 rounded-lg">
      <div className="text-2xl font-bold text-green-600">B+</div>
      <div className="text-sm text-green-700">Overall Grade</div>
      <div className="text-xs text-gray-600 mt-1">Strong in Math, Reading</div>
    </div>
  );
};

const MiniVocabularyStats: React.FC<{ studentId?: number }> = ({ studentId }) => {
  return (
    <div className="p-3 bg-purple-50 rounded-lg">
      <div className="text-2xl font-bold text-purple-600">156</div>
      <div className="text-sm text-purple-700">Words This Term</div>
      <div className="text-xs text-gray-600 mt-1">+12 this week</div>
    </div>
  );
};

// Utility function for default titles
function getDefaultTitle(type: AnalyticsWidgetType): string {
  const titles = {
    'curriculum-heatmap': 'Curriculum Coverage',
    'domain-radar': 'Domain Strengths',
    'theme-analytics': 'Theme Usage',
    'vocabulary-growth': 'Vocabulary Progress',
    'mini-curriculum-summary': 'Coverage',
    'mini-domain-overview': 'Performance',
    'mini-vocabulary-stats': 'Vocabulary',
  };

  return titles[type] || 'Analytics';
}

// Hook for other agents to easily integrate analytics
export const useAnalyticsWidget = (config: AnalyticsWidgetConfig) => {
  return React.useMemo(() => {
    return <AnalyticsWidget {...config} />;
  }, [config]);
};

// Batch widget component for dashboard layouts
export interface AnalyticsDashboardProps {
  widgets: AnalyticsWidgetConfig[];
  layout?: 'grid' | 'flex' | 'custom';
  columns?: number;
  gap?: string;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  widgets,
  layout = 'grid',
  columns = 3,
  gap = 'gap-4',
  className = '',
}) => {
  const layoutClass =
    layout === 'grid'
      ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} ${gap}`
      : layout === 'flex'
        ? `flex flex-wrap ${gap}`
        : '';

  return (
    <div className={`${layoutClass} ${className}`}>
      {widgets.map((widget, index) => (
        <AnalyticsWidget key={`widget-${index}`} {...widget} />
      ))}
    </div>
  );
};

// Export individual components for direct use
export { CurriculumHeatmap, DomainRadarChart, ThemeAnalyticsDashboard, VocabularyGrowthDashboard };

export default AnalyticsWidget;
