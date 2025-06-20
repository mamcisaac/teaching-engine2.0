/**
 * Analytics Services Index
 *
 * Central export for all analytics-related services that provide
 * data aggregation and insights for Teaching Engine 2.0 dashboards.
 */

// Use simplified services for now to avoid Prisma schema issues
export * from './curriculumAnalyticsSimple';
export * from './domainAnalyticsSimple';
export * from './themeAnalyticsSimple';
export * from './vocabularyAnalytics';
export * from './exportService';
export * from './analyticsCache';
export * from './mockDataService';

// TODO: Re-enable these once Prisma schema is updated
// export * from './domainAnalytics';
// export * from './themeAnalytics';
