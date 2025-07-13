/* eslint-disable @typescript-eslint/no-unused-vars */
import { trace, metrics, context, SpanStatusCode } from '@opentelemetry/api';
import type { Span, SpanOptions, Attributes } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
// import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

import { logger } from '../logger';

// Environment configuration
const OTEL_ENABLED = process.env.OTEL_ENABLED === 'true';
const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME ?? 'teaching-engine-api';
const OTEL_ENVIRONMENT = process.env.NODE_ENV ?? 'development';
const OTEL_ENDPOINT = process.env.OTEL_ENDPOINT ?? 'http://localhost:4318';

// Initialize resource
const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: OTEL_SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version ?? '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: OTEL_ENVIRONMENT,
  }),
);

// Initialize SDK
let otelSDK: NodeSDK | null = null;

export const initTelemetry = async (): Promise<void> => {
  if (!OTEL_ENABLED) {
    logger.info('OpenTelemetry is disabled');
    return;
  }

  try {
    // Trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: `${OTEL_ENDPOINT}/v1/traces`,
      headers: {},
    });

    // Metric exporter
    const metricExporter = new OTLPMetricExporter({
      url: `${OTEL_ENDPOINT}/v1/metrics`,
      headers: {},
    });

    // Initialize SDK
    otelSDK = new NodeSDK({
      resource,
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 10000, // Export every 10 seconds
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable fs instrumentation to reduce noise
          },
        }),
      ],
    });

    // Start SDK
    await otelSDK.start();
    logger.info(
      {
        endpoint: OTEL_ENDPOINT,
        serviceName: OTEL_SERVICE_NAME,
        environment: OTEL_ENVIRONMENT,
      },
      'OpenTelemetry initialized successfully',
    );

    // Graceful shutdown
    process.on('SIGTERM', () => {
      otelSDK
        ?.shutdown()
        .then(() => {
 logger.info('OpenTelemetry terminated');
 return undefined;
})
        .catch((error) => {
 logger.error('Error terminating OpenTelemetry', error);
 return undefined;
});
    });
  } catch (_error) {
    logger.error('Failed to initialize OpenTelemetry', _error);
  }
};

// Get tracer instance
export const tracer = trace.getTracer(OTEL_SERVICE_NAME);

// Get meter instance
export const meter = metrics.getMeter(OTEL_SERVICE_NAME);

// Custom span wrapper for easier instrumentation
export const withSpan = async <T>(
  spanName: string,
  spanOptions: SpanOptions & { attributes?: Attributes } = {},
  fn: (span: Span) => Promise<T>,
): Promise<T> => {
  if (!OTEL_ENABLED) {
    return fn({} as Span);
  }

  return tracer.startActiveSpan(spanName, spanOptions, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (_error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: _error instanceof Error ? _error.message : String(_error),
      });
      span.recordException(_error as Error);
      throw _error;
    } finally {
      span.end();
    }
  });
};

// Utility to add attributes to current span
export const addSpanAttributes = (attributes: Attributes): void => {
  if (!OTEL_ENABLED) {
return;
}

  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
};

// Utility to record an event in the current span
export const recordSpanEvent = (name: string, attributes?: Attributes): void => {
  if (!OTEL_ENABLED) {
return;
}

  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
};

// Create custom metrics
export const httpRequestDuration = meter.createHistogram('http_request_duration_ms', {
  description: 'Duration of HTTP requests in milliseconds',
  unit: 'ms',
});

export const httpRequestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

export const dbQueryDuration = meter.createHistogram('db_query_duration_ms', {
  description: 'Duration of database queries in milliseconds',
  unit: 'ms',
});

export const dbQueryCounter = meter.createCounter('db_queries_total', {
  description: 'Total number of database queries',
});

export const cacheHitCounter = meter.createCounter('cache_hits_total', {
  description: 'Total number of cache hits',
});

export const cacheMissCounter = meter.createCounter('cache_misses_total', {
  description: 'Total number of cache misses',
});

export const aiOperationDuration = meter.createHistogram('ai_operation_duration_ms', {
  description: 'Duration of AI operations in milliseconds',
  unit: 'ms',
});

export const aiOperationCounter = meter.createCounter('ai_operations_total', {
  description: 'Total number of AI operations',
});

// Business metrics
export const planCreatedCounter = meter.createCounter('plans_created_total', {
  description: 'Total number of plans created',
});

export const userActivityCounter = meter.createCounter('user_activities_total', {
  description: 'Total number of user activities',
});

// Error metrics
export const errorCounter = meter.createCounter('errors_total', {
  description: 'Total number of errors',
});

// System metrics
export const activeUsersGauge = meter.createObservableGauge('active_users', {
  description: 'Number of active users',
});

export const systemHealthGauge = meter.createObservableGauge('system_health', {
  description: 'System health score (0-100)',
});

// Initialize observable gauges with callbacks
let activeUserCount = 0;
let systemHealthScore = 100;

activeUsersGauge.addCallback(async (observableResult) => {
  observableResult.observe(activeUserCount);
});

systemHealthGauge.addCallback(async (observableResult) => {
  observableResult.observe(systemHealthScore);
});

// Utility functions to update observable values
export const updateActiveUsers = (count: number): void => {
  activeUserCount = count;
};

export const updateSystemHealth = (score: number): void => {
  systemHealthScore = Math.max(0, Math.min(100, score));
};

// Export context propagation utilities
export { context };
