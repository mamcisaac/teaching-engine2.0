# Monitoring Guide - Teaching Engine 2.0

## Overview

Teaching Engine 2.0 includes a comprehensive monitoring system that provides:
- **Distributed Tracing** with OpenTelemetry
- **Real-time Metrics** with Prometheus-compatible format
- **Interactive Dashboard** with system and business metrics
- **Automated Alerting** with email and webhook support
- **Performance Monitoring** with detailed insights

## Components

### 1. OpenTelemetry Integration

The application uses OpenTelemetry for distributed tracing and advanced metrics collection.

**Configuration:**
```bash
# Enable OpenTelemetry
OTEL_ENABLED=true
OTEL_SERVICE_NAME=teaching-engine-api
OTEL_ENDPOINT=http://localhost:4318
NODE_ENV=production
```

**Features:**
- Automatic instrumentation of HTTP requests, database queries, and external calls
- Custom spans for business operations
- Context propagation across services
- Performance metrics with percentiles

### 2. Metrics Collection

The application collects various metrics in Prometheus format:

**System Metrics:**
- CPU usage and load averages
- Memory usage and garbage collection
- Process uptime and health

**Application Metrics:**
- HTTP request rates and latencies
- Database query performance
- Cache hit/miss rates
- API error rates

**Business Metrics:**
- Plans created (by type)
- Active users
- Curriculum coverage
- AI operation success rates

**Access Metrics:**
- Prometheus format: `GET /metrics`
- JSON format: `GET /api/metrics/json` (authenticated)
- Real-time: `GET /api/metrics/realtime` (authenticated)

### 3. Monitoring Dashboard

Access the comprehensive dashboard at `/api/monitoring/dashboard`

**Dashboard Sections:**

#### System Health
```json
{
  "system": {
    "uptime": 86400,
    "memory": {
      "total": 8589934592,
      "used": 4294967296,
      "percentage": 50
    },
    "cpu": {
      "cores": 8,
      "usage": 25
    }
  }
}
```

#### Application Performance
```json
{
  "application": {
    "requests": {
      "total": 10000,
      "per_minute": 166,
      "success_rate": 99.5
    },
    "response_times": {
      "p50": 45,
      "p90": 120,
      "p95": 200,
      "p99": 500
    }
  }
}
```

#### Business Metrics
```json
{
  "business": {
    "plans": {
      "total": 1500,
      "created_today": 25,
      "by_type": {
        "lesson": 1000,
        "unit": 400,
        "long_range": 100
      }
    },
    "curriculum": {
      "coverage_percentage": 78.5,
      "most_used_subjects": [
        {"subject": "Mathematics", "count": 450},
        {"subject": "Language Arts", "count": 380}
      ]
    }
  }
}
```

### 4. Automated Alerting

The system monitors for various conditions and sends alerts automatically.

**Alert Types:**
- **Critical**: Database failures, high error rates, memory exhaustion
- **Warning**: Slow response times, high AI failure rates
- **Info**: Low cache hit rates, configuration issues

**Configuration:**
```bash
# Email alerts
ALERT_EMAIL_ENABLED=true
ALERT_EMAIL_TO=admin@teaching-engine.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@teaching-engine.com
SMTP_PASS=your-password

# Webhook alerts
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Check interval (milliseconds)
ALERT_CHECK_INTERVAL=60000
```

**Alert Examples:**

1. **High Error Rate Alert**
   - Triggers when error rate exceeds 10%
   - Includes error count and total requests
   - Cooldown: 15 minutes

2. **Database Connection Failure**
   - Triggers on database connectivity issues
   - Critical severity
   - Immediate notification

3. **Memory Usage Alert**
   - Triggers at 90% memory usage
   - Includes heap statistics
   - Cooldown: 10 minutes

### 5. API Endpoints

#### Dashboard Endpoint
```bash
GET /api/monitoring/dashboard
Authorization: Bearer <token>

Response: Complete dashboard metrics
```

#### Alert Status
```bash
GET /api/monitoring/alerts
Authorization: Bearer <token>

Response:
{
  "alerts": [
    {
      "id": "high_error_rate",
      "name": "High Error Rate",
      "active": false,
      "lastTriggered": "2025-07-04T10:00:00Z"
    }
  ],
  "monitoring": {
    "enabled": true,
    "emailEnabled": true,
    "webhookEnabled": true
  }
}
```

#### Manual Alert Trigger (Testing)
```bash
POST /api/monitoring/alerts/high_error_rate/trigger
Authorization: Bearer <token>
Content-Type: application/json

{
  "context": {
    "errorRate": 15.5,
    "errorCount": 155,
    "totalRequests": 1000
  }
}
```

#### Detailed Health Check
```bash
GET /api/monitoring/health/detailed

Response:
{
  "status": "healthy",
  "uptime": 86400,
  "services": {
    "database": true,
    "cache": true,
    "monitoring": true
  }
}
```

## Integration with External Tools

### Prometheus

1. Configure Prometheus to scrape metrics:
```yaml
scrape_configs:
  - job_name: 'teaching-engine'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

2. Example queries:
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_errors_total[5m]) / rate(http_requests_total[5m])

# P95 latency
histogram_quantile(0.95, http_request_duration_ms)
```

### Grafana

Import the dashboard template from `monitoring/grafana-dashboard.json` for:
- System metrics visualization
- Application performance graphs
- Business metrics tracking
- Alert history

### Jaeger (OpenTelemetry)

1. Run Jaeger locally:
```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

2. Access UI at http://localhost:16686

3. View traces for:
- API request flows
- Database query timing
- External service calls
- Custom business operations

## Best Practices

### 1. Custom Instrumentation

Add custom spans for important operations:
```typescript
import { withSpan } from '@/monitoring';

await withSpan('curriculum.import', async (span) => {
  span.setAttributes({
    'curriculum.grade': grade,
    'curriculum.subject': subject,
  });
  
  // Your operation here
  const result = await importCurriculum(file);
  
  span.addEvent('curriculum.imported', {
    expectations: result.expectations.length,
  });
  
  return result;
});
```

### 2. Business Metrics

Track important business events:
```typescript
import { planCreatedCounter, userActivityCounter } from '@/monitoring';

// When a plan is created
planCreatedCounter.add(1, {
  type: 'lesson',
  grade: 5,
  subject: 'Mathematics',
});

// Track user activity
userActivityCounter.add(1, {
  action: 'login',
  userId: user.id,
});
```

### 3. Alert Configuration

Customize alerts for your environment:
```typescript
// Add custom alert in alerting.ts
{
  id: 'low_plan_creation',
  name: 'Low Plan Creation Rate',
  condition: async () => {
    const recentPlans = await getRecentPlanCount();
    return recentPlans < 10; // Less than 10 plans per day
  },
  message: (ctx) => `Only ${ctx.count} plans created today`,
  severity: 'info',
  cooldown: 1440, // Once per day
  channels: ['log', 'email'],
}
```

### 4. Performance Optimization

Monitor and optimize slow operations:
```typescript
// Identify slow queries
const slowQueries = await prisma.$queryRaw`
  SELECT query, duration_ms 
  FROM query_log 
  WHERE duration_ms > 1000
  ORDER BY duration_ms DESC
`;

// Add appropriate indices based on findings
```

## Troubleshooting

### High Memory Usage
1. Check for memory leaks in dashboard
2. Review cache sizes in metrics
3. Analyze heap dumps if needed

### Missing Traces
1. Verify OTEL_ENABLED=true
2. Check OTEL_ENDPOINT connectivity
3. Ensure Jaeger is running

### Alert Not Firing
1. Check alert status endpoint
2. Verify cooldown period
3. Test with manual trigger
4. Check email/webhook configuration

### Metrics Not Updating
1. Verify metrics endpoint is accessible
2. Check for errors in logs
3. Ensure metrics middleware is applied

## Performance Impact

The monitoring system has minimal performance impact:
- OpenTelemetry: <2% overhead with sampling
- Metrics collection: <1ms per request
- Dashboard queries: Cached for 30 seconds
- Alert checking: Runs in background thread

## Security Considerations

1. **Authentication**: All monitoring endpoints except `/metrics` require authentication
2. **Rate Limiting**: Monitoring endpoints are rate-limited
3. **Data Privacy**: No student data in metrics or traces
4. **Sensitive Data**: Automatically redacted in logs and traces

## Maintenance

### Daily Tasks
- Review dashboard for anomalies
- Check alert history
- Monitor error rates

### Weekly Tasks
- Analyze performance trends
- Review slow query logs
- Update alert thresholds if needed

### Monthly Tasks
- Archive old metrics data
- Review and optimize dashboards
- Update monitoring documentation

## Conclusion

The comprehensive monitoring system provides deep insights into application health, performance, and usage patterns. By leveraging OpenTelemetry, Prometheus-compatible metrics, and automated alerting, you can proactively identify and resolve issues before they impact users.