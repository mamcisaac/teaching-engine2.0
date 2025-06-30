# Performance & Visual Testing Implementation Guide

## Teaching Engine 2.0 - Complete Setup Instructions

### 🚀 Quick Start

This guide provides step-by-step instructions to implement the comprehensive performance benchmarking and visual regression testing strategy for Teaching Engine 2.0.

### 📋 Prerequisites

**Required Software:**

- Node.js 18+ with pnpm
- Docker & Docker Compose (for monitoring)
- Git for version control

**Required Dependencies:**

```bash
# Install performance testing tools
npm install -g artillery

# Install visual testing dependencies
pnpm add -D @playwright/test playwright
pnpm add -D @percy/cli @percy/playwright

# Install monitoring tools (optional)
npm install -g autocannon k6
```

### 🏗️ Step 1: Performance Testing Setup

#### 1.1 Install Artillery and Dependencies

```bash
# Navigate to project root
cd /path/to/teaching-engine2.0

# Install Artillery globally
npm install -g artillery

# Install additional performance testing dependencies
cd tests/performance
pnpm install
```

#### 1.2 Configure Performance Test Environment

```bash
# Create performance test environment file
cd tests/performance
cp .env.example .env.performance

# Edit the configuration
cat > .env.performance << EOF
PERFORMANCE_TEST_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/teaching_engine_performance_test
NODE_ENV=performance
JWT_SECRET=performance-test-secret-key
OPENAI_API_KEY=your-openai-key-for-ai-tests
EOF
```

#### 1.3 Verify Performance Test Setup

```bash
# Start the server in performance mode
cd server
NODE_ENV=performance pnpm start &

# Run a quick performance test
cd ../tests/performance
artillery quick --count 10 --num 3 http://localhost:3000/api/health

# Should show successful responses
```

### 🎨 Step 2: Visual Regression Testing Setup

#### 2.1 Install Playwright and Configure

```bash
# Navigate to project root
cd /path/to/teaching-engine2.0

# Install Playwright
cd client
pnpm add -D @playwright/test
npx playwright install --with-deps

# Install visual testing tools
pnpm add -D @percy/cli @percy/playwright
```

#### 2.2 Configure Visual Testing Environment

```bash
# Create visual test configuration
cd tests/visual
cp playwright-visual.config.example.ts playwright-visual.config.ts

# Set up environment variables
cat > .env.visual << EOF
VISUAL_TEST_BASE_URL=http://localhost:5173
PERCY_TOKEN=your-percy-token-here
DISABLE_ANIMATIONS=true
CI=false
EOF
```

#### 2.3 Verify Visual Testing Setup

```bash
# Build client for testing
cd client
pnpm build

# Start client in preview mode
pnpm preview --port 5173 &

# Run a simple visual test
cd ../tests/visual
npx playwright test critical-pages.spec.ts --project="Desktop Chrome - Light Theme" --grep="Dashboard"
```

### 📊 Step 3: Monitoring Setup (Optional)

#### 3.1 Set Up Prometheus and Grafana

```bash
# Create monitoring directory
mkdir -p tests/performance/monitoring/docker

# Create Docker Compose for monitoring stack
cat > tests/performance/monitoring/docker/docker-compose.yml << EOF
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: teaching-engine-prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: teaching-engine-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./grafana-dashboard.json:/var/lib/grafana/dashboards/teaching-engine.json
    networks:
      - monitoring

volumes:
  grafana-storage:

networks:
  monitoring:
    driver: bridge
EOF
```

#### 3.2 Configure Prometheus

```bash
# Create Prometheus configuration
cat > tests/performance/monitoring/docker/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "teaching_engine_rules.yml"

scrape_configs:
  - job_name: 'teaching-engine-server'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: /metrics
    scrape_interval: 5s

  - job_name: 'teaching-engine-client'
    static_configs:
      - targets: ['host.docker.internal:5173']
    metrics_path: /metrics
    scrape_interval: 10s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
EOF
```

#### 3.3 Start Monitoring Stack

```bash
# Start monitoring services
cd tests/performance/monitoring/docker
docker-compose up -d

# Verify services are running
docker-compose ps

# Access Grafana at http://localhost:3001 (admin/admin123)
# Access Prometheus at http://localhost:9090
```

### 🔧 Step 4: CI/CD Integration

#### 4.1 GitHub Actions Setup

The GitHub Actions workflow is already configured in `.github/workflows/performance-visual-testing.yml`. To enable it:

```bash
# Verify the workflow file exists
ls .github/workflows/performance-visual-testing.yml

# Set up required secrets in your GitHub repository:
# 1. Go to repository Settings > Secrets and variables > Actions
# 2. Add the following secrets:
#    - PERCY_TOKEN (for visual testing)
#    - PERFORMANCE_ALERT_WEBHOOK (for performance alerts)
#    - METRICS_STORAGE_URL (for metrics storage)
```

#### 4.2 Configure Environment Variables

Add these to your repository's environment variables:

```bash
# Performance testing
PERFORMANCE_TEST_URL=http://localhost:3000
VISUAL_TEST_BASE_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/teaching_engine_test

# Security
JWT_SECRET=github-actions-test-secret-key

# Testing flags
NODE_ENV=test
CI=true
DISABLE_ANIMATIONS=true
```

### 🧪 Step 5: Running Tests

#### 5.1 Performance Testing Commands

```bash
# Run all performance scenarios
cd tests/performance
node scripts/run-performance-suite.js

# Run specific scenario
artillery run artillery-config.yml --scenario teacher_login_workflow

# Run with custom load
artillery run artillery-config.yml --overrides '{"config":{"phases":[{"duration":60,"arrivalRate":20}]}}'

# Generate HTML report
artillery run artillery-config.yml --output results.json
artillery report results.json --output report.html
```

#### 5.2 Visual Testing Commands

```bash
# Run all visual tests
cd tests/visual
npx playwright test --config=playwright-visual.config.ts

# Run specific project (browser/device)
npx playwright test --project="Desktop Chrome - Light Theme"

# Update visual baselines (after intentional UI changes)
npx playwright test --update-snapshots

# Run only accessibility tests
npx playwright test --grep "Accessibility"

# Generate HTML report
npx playwright show-report
```

#### 5.3 Combined Test Execution

```bash
# Run both performance and visual tests
cd /path/to/teaching-engine2.0

# Start servers
pnpm dev &  # Start development servers

# Run performance tests
cd tests/performance && node scripts/run-performance-suite.js &

# Run visual tests
cd tests/visual && npx playwright test --config=playwright-visual.config.ts &

# Wait for both to complete
wait
```

### 📈 Step 6: Interpreting Results

#### 6.1 Performance Test Results

**Key Metrics to Monitor:**

- **Response Time**: 95th percentile should be <2s for critical paths
- **Throughput**: Should handle >50 requests/second
- **Error Rate**: Should be <1%
- **Resource Usage**: CPU <50%, Memory stable

**Reading Artillery Reports:**

```bash
# View summary
cat tests/performance/results/performance-report-*.md

# Key sections to review:
# - Test Summary: Overall request counts and duration
# - Response Time Analysis: p95 and p99 percentiles
# - SLA Compliance: Pass/fail status for each threshold
# - Teacher Workflow Impact: Real-world implications
```

#### 6.2 Visual Test Results

**Understanding Playwright Visual Reports:**

```bash
# Open interactive report
npx playwright show-report

# Key elements:
# - Screenshot comparisons showing differences
# - Browser/device coverage matrix
# - Accessibility test results
# - Print layout validation
```

**Common Visual Issues:**

- **Font rendering differences**: Usually browser-specific, may need tolerance adjustment
- **Animation timing**: Ensure `DISABLE_ANIMATIONS=true` in test environment
- **Dynamic content**: Hide timestamps, loading indicators in test CSS
- **Image loading**: Ensure all images loaded before screenshot

### 🚨 Step 7: Troubleshooting

#### 7.1 Common Performance Issues

**Server Not Ready:**

```bash
# Check server health
curl -f http://localhost:3000/api/health

# Check logs
cd server && pnpm logs

# Restart with debug
DEBUG=* pnpm start
```

**Database Connection Issues:**

```bash
# Verify database is running
pg_isready -h localhost -p 5432

# Reset test database
cd packages/database
pnpm db:push --force-reset
pnpm db:seed
```

**Artillery Test Failures:**

```bash
# Check Artillery configuration
artillery validate tests/performance/artillery-config.yml

# Run with debug output
DEBUG=artillery:* artillery run artillery-config.yml
```

#### 7.2 Common Visual Testing Issues

**Playwright Browser Issues:**

```bash
# Reinstall browsers
npx playwright install --force

# Clear browser cache
rm -rf ~/.cache/ms-playwright
npx playwright install
```

**Screenshot Inconsistencies:**

```bash
# Increase wait times in test
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

# Hide dynamic elements
await page.addStyleTag({
  content: '.dynamic-element { visibility: hidden !important; }'
});
```

**Client Build Issues:**

```bash
# Clean build
cd client
rm -rf dist node_modules
pnpm install
pnpm build

# Check for build errors
pnpm build 2>&1 | tee build.log
```

### 📚 Step 8: Maintenance and Updates

#### 8.1 Regular Maintenance Tasks

**Weekly:**

- Review performance metrics and trends
- Update visual baselines if UI changes were made
- Check for failed tests in CI/CD

**Monthly:**

- Update performance thresholds based on real data
- Review and optimize slow tests
- Update test scenarios based on new features

**Quarterly:**

- Comprehensive review of test coverage
- Update monitoring dashboards
- Performance benchmark updates

#### 8.2 Updating Baselines

**Performance Baselines:**

```bash
# After optimization, update baseline
cd tests/performance
cp results/latest-results.json baseline-metrics.json
git add baseline-metrics.json
git commit -m "Update performance baseline after optimization"
```

**Visual Baselines:**

```bash
# After intentional UI changes
cd tests/visual
npx playwright test --update-snapshots
git add test-results/
git commit -m "Update visual baselines for UI changes"
```

### 🎯 Success Criteria

Your implementation is successful when:

✅ **Performance tests run automatically in CI/CD**
✅ **Visual regression tests catch UI changes**
✅ **Monitoring dashboard shows real-time metrics**
✅ **All SLA thresholds are being met**
✅ **Tests run consistently across environments**
✅ **Team can easily interpret and act on results**

### 📞 Support and Resources

- **Documentation**: See `/docs/testing/PERFORMANCE_VISUAL_TESTING_STRATEGY.md`
- **Troubleshooting**: See `/docs/claude/troubleshooting.md`
- **Performance Results**: Check `/tests/performance/results/`
- **Visual Test Reports**: Check `/tests/visual/visual-test-results/`

For additional support, review the test output logs and monitoring dashboards to identify specific issues.
