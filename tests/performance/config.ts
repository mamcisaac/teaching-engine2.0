/**
 * Performance Testing Configuration
 * Defines baseline metrics, thresholds, and test scenarios for the Teaching Engine 2.0
 */

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
}

export interface PerformanceThresholds {
  maxResponseTime: number;
  minThroughput: number;
  maxMemoryUsage: number;
  maxCpuUsage: number;
  maxErrorRate: number;
}

export const PERFORMANCE_BASELINES: Record<string, PerformanceThresholds> = {
  // API Endpoints
  'GET /api/curriculum-expectations': {
    maxResponseTime: 500, // ms
    minThroughput: 100, // requests/second
    maxMemoryUsage: 50, // MB
    maxCpuUsage: 30, // %
    maxErrorRate: 0.1, // %
  },
  'POST /api/etfo-lesson-plans': {
    maxResponseTime: 1000,
    minThroughput: 50,
    maxMemoryUsage: 100,
    maxCpuUsage: 50,
    maxErrorRate: 0.5,
  },
  'POST /api/curriculum-import': {
    maxResponseTime: 5000, // PDF processing takes time
    minThroughput: 10,
    maxMemoryUsage: 200,
    maxCpuUsage: 70,
    maxErrorRate: 1.0,
  },
  'GET /api/newsletters': {
    maxResponseTime: 800,
    minThroughput: 75,
    maxMemoryUsage: 75,
    maxCpuUsage: 40,
    maxErrorRate: 0.2,
  },

  // Frontend Pages
  'dashboard-page': {
    maxResponseTime: 2000, // LCP
    minThroughput: 1, // Not applicable
    maxMemoryUsage: 150,
    maxCpuUsage: 60,
    maxErrorRate: 0,
  },
  'lesson-plans-page': {
    maxResponseTime: 1500,
    minThroughput: 1,
    maxMemoryUsage: 120,
    maxCpuUsage: 50,
    maxErrorRate: 0,
  },
  'curriculum-import-page': {
    maxResponseTime: 3000, // File upload interface
    minThroughput: 1,
    maxMemoryUsage: 200,
    maxCpuUsage: 70,
    maxErrorRate: 0,
  },
};

export const LOAD_TEST_SCENARIOS = [
  {
    name: 'normal-usage',
    description: 'Typical teacher workflow during peak usage',
    duration: '5m',
    virtualUsers: 10,
    rampUpTime: '1m',
    scenarios: [
      { endpoint: '/api/auth/login', weight: 5 },
      { endpoint: '/api/curriculum-expectations', weight: 30 },
      { endpoint: '/api/etfo-lesson-plans', weight: 25 },
      { endpoint: '/api/unit-plans', weight: 20 },
      { endpoint: '/api/newsletters', weight: 10 },
      { endpoint: '/api/students', weight: 10 },
    ],
  },
  {
    name: 'curriculum-import-stress',
    description: 'Multiple teachers importing curriculum documents',
    duration: '3m',
    virtualUsers: 5,
    rampUpTime: '30s',
    scenarios: [
      { endpoint: '/api/curriculum-import', weight: 60 },
      { endpoint: '/api/curriculum-expectations', weight: 40 },
    ],
  },
  {
    name: 'newsletter-generation',
    description: 'Peak newsletter generation period',
    duration: '4m',
    virtualUsers: 8,
    rampUpTime: '45s',
    scenarios: [
      { endpoint: '/api/newsletters/generate', weight: 50 },
      { endpoint: '/api/parent-summary', weight: 30 },
      { endpoint: '/api/students', weight: 20 },
    ],
  },
];

export const VISUAL_REGRESSION_PAGES = [
  {
    name: 'dashboard',
    url: '/dashboard',
    viewports: [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ],
    waitForSelector: '[data-testid="dashboard-content"]',
    masks: [
      '[data-testid="current-date"]',
      '[data-testid="user-avatar"]',
      '[data-testid="notification-count"]',
    ],
  },
  {
    name: 'lesson-plans',
    url: '/etfo-lesson-plans',
    viewports: [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
    ],
    waitForSelector: '[data-testid="lesson-plans-table"]',
    masks: ['[data-testid="created-date"]', '[data-testid="modified-date"]'],
  },
  {
    name: 'curriculum-expectations',
    url: '/curriculum-expectations',
    viewports: [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
    ],
    waitForSelector: '[data-testid="expectations-grid"]',
    masks: [],
  },
  {
    name: 'unit-plans',
    url: '/unit-plans',
    viewports: [{ width: 1920, height: 1080, name: 'desktop' }],
    waitForSelector: '[data-testid="unit-plans-container"]',
    masks: ['[data-testid="creation-timestamp"]'],
  },
];

export const MEMORY_THRESHOLDS = {
  // Frontend memory usage (MB)
  pageLoad: 50,
  afterNavigation: 100,
  afterDataLoad: 150,
  afterFileUpload: 250,

  // Backend memory usage (MB)
  baseMemory: 100,
  underLoad: 300,
  peakUsage: 500,

  // Memory leak detection
  maxGrowthRate: 10, // MB per minute
  gcEfficiency: 0.8, // Should reclaim at least 80% of memory
};

export const PERFORMANCE_ALERTS = {
  responseTimeIncrease: 50, // % increase from baseline
  throughputDecrease: 25, // % decrease from baseline
  memoryLeakThreshold: 100, // MB growth without GC
  errorRateSpike: 5, // % increase in error rate
  cpuUsageThreshold: 80, // % CPU usage
};
