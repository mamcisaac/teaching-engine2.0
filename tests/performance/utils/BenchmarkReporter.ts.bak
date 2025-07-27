/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Benchmark Reporter
 * Generates detailed performance reports and comparisons
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { BenchmarkResult } from '../benchmark.suite';

interface PerformanceReport {
  timestamp: string;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    averageResponseTime: number;
    averageMemoryUsage: number;
  };
  results: BenchmarkResult[];
  recommendations: string[];
  trends: {
    responseTime: 'improving' | 'degrading' | 'stable';
    memoryUsage: 'improving' | 'degrading' | 'stable';
  };
}

interface HistoricalData {
  reports: PerformanceReport[];
}

export class BenchmarkReporter {
  private reportDir: string;

  constructor() {
    this.reportDir = path.join(process.cwd(), 'test-results', 'performance');
  }

  async generateReport(results: BenchmarkResult[]): Promise<void> {
    await this.ensureReportDirectory();

    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(results),
      results,
      recommendations: this.generateRecommendations(results),
      trends: await this.analyzeTrends(results),
    };

    // Save detailed JSON report
    await this.saveJSONReport(report);

    // Generate HTML report
    await this.generateHTMLReport(report);

    // Generate markdown summary
    await this.generateMarkdownSummary(report);

    // Update historical data
    await this.updateHistoricalData(report);

    console.log(`📊 Performance report generated: ${this.reportDir}`);
  }

  private generateSummary(results: BenchmarkResult[]) {
    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;

    const avgResponseTime =
      results.reduce((sum, r) => sum + r.metrics.responseTime, 0) / results.length;
    const avgMemoryUsage =
      results.reduce((sum, r) => sum + r.metrics.memoryUsage, 0) / results.length;

    return {
      totalTests: results.length,
      passed,
      failed,
      averageResponseTime: Math.round(avgResponseTime),
      averageMemoryUsage: Math.round(avgMemoryUsage * 100) / 100,
    };
  }

  private generateRecommendations(results: BenchmarkResult[]): string[] {
    const recommendations: string[] = [];

    // Analyze slow responses
    const slowResponses = results.filter((r) => r.metrics.responseTime > 2000);
    if (slowResponses.length > 0) {
      recommendations.push(
        `🐌 ${slowResponses.length} tests have slow response times (>2s). Consider optimizing: ${slowResponses.map((r) => r.name).join(', ')}`,
      );
    }

    // Analyze high memory usage
    const highMemory = results.filter((r) => r.metrics.memoryUsage > 150);
    if (highMemory.length > 0) {
      recommendations.push(
        `🧠 ${highMemory.length} tests show high memory usage (>150MB). Review memory management for: ${highMemory.map((r) => r.name).join(', ')}`,
      );
    }

    // Analyze failed tests
    const failed = results.filter((r) => !r.passed);
    if (failed.length > 0) {
      recommendations.push(
        `❌ ${failed.length} tests failed performance thresholds. Immediate attention required for: ${failed.map((r) => r.name).join(', ')}`,
      );
    }

    // LCP recommendations
    const slowLCP = results.filter((r) => r.metrics.largestContentfulPaint > 2500);
    if (slowLCP.length > 0) {
      recommendations.push(
        `🖼️ Largest Contentful Paint is slow (>2.5s) for: ${slowLCP.map((r) => r.name).join(', ')}. Consider image optimization and code splitting.`,
      );
    }

    // CLS recommendations
    const highCLS = results.filter((r) => r.metrics.cumulativeLayoutShift > 0.1);
    if (highCLS.length > 0) {
      recommendations.push(
        `📐 High Cumulative Layout Shift detected for: ${highCLS.map((r) => r.name).join(', ')}. Add size attributes to images and reserve space for dynamic content.`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All performance metrics are within acceptable ranges. Great job!');
    }

    return recommendations;
  }

  private async analyzeTrends(currentResults: BenchmarkResult[]): Promise<{
    responseTime: 'improving' | 'degrading' | 'stable';
    memoryUsage: 'improving' | 'degrading' | 'stable';
  }> {
    try {
      const historical = await this.loadHistoricalData();
      if (historical.reports.length < 2) {
        return { responseTime: 'stable', memoryUsage: 'stable' };
      }

      const previousReport = historical.reports[historical.reports.length - 1];
      const currentAvgResponseTime =
        currentResults.reduce((sum, r) => sum + r.metrics.responseTime, 0) / currentResults.length;
      const currentAvgMemory =
        currentResults.reduce((sum, r) => sum + r.metrics.memoryUsage, 0) / currentResults.length;

      const responseTimeTrend = this.calculateTrend(
        previousReport.summary.averageResponseTime,
        currentAvgResponseTime,
      );
      const memoryTrend = this.calculateTrend(
        previousReport.summary.averageMemoryUsage,
        currentAvgMemory,
      );

      return {
        responseTime: responseTimeTrend,
        memoryUsage: memoryTrend,
      };
    } catch (_error) {
      return { responseTime: 'stable', memoryUsage: 'stable' };
    }
  }

  private calculateTrend(previous: number, current: number): 'improving' | 'degrading' | 'stable' {
    const change = ((current - previous) / previous) * 100;

    if (change > 10) return 'degrading';
    if (change < -10) return 'improving';
    return 'stable';
  }

  private async ensureReportDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.reportDir, { recursive: true });
    } catch (_error) {
      // Directory may already exist
    }
  }

  private async saveJSONReport(report: PerformanceReport): Promise<void> {
    const filename = `performance-report-${Date.now()}.json`;
    const filepath = path.join(this.reportDir, filename);

    await fs.writeFile(filepath, JSON.stringify(report, null, 2));

    // Also save as latest
    const latestPath = path.join(this.reportDir, 'latest.json');
    await fs.writeFile(latestPath, JSON.stringify(report, null, 2));
  }

  private async generateHTMLReport(report: PerformanceReport): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Report - Teaching Engine 2.0</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #007acc; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; border-left: 4px solid #007acc; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007acc; }
        .metric-label { color: #666; margin-top: 5px; }
        .results-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .results-table th, .results-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .results-table th { background: #f8f9fa; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin-bottom: 30px; }
        .trends { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .trend-card { background: #f8f9fa; padding: 20px; border-radius: 6px; }
        .improving { color: #28a745; }
        .degrading { color: #dc3545; }
        .stable { color: #6c757d; }
        .chart-container { margin: 20px 0; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Performance Report</h1>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="metric-card">
                <div class="metric-value">${report.summary.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.averageResponseTime}ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.averageMemoryUsage}MB</div>
                <div class="metric-label">Avg Memory Usage</div>
            </div>
        </div>

        <div class="chart-container">
            <canvas id="responseTimeChart" width="400" height="200"></canvas>
        </div>

        <h2>Test Results</h2>
        <table class="results-table">
            <thead>
                <tr>
                    <th>Test Name</th>
                    <th>Response Time (ms)</th>
                    <th>Memory Usage (MB)</th>
                    <th>LCP (ms)</th>
                    <th>CLS</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${report.results
                  .map(
                    (result) => `
                    <tr>
                        <td>${result.name}</td>
                        <td>${Math.round(result.metrics.responseTime)}</td>
                        <td>${Math.round(result.metrics.memoryUsage * 100) / 100}</td>
                        <td>${Math.round(result.metrics.largestContentfulPaint)}</td>
                        <td>${Math.round(result.metrics.cumulativeLayoutShift * 1000) / 1000}</td>
                        <td class="${result.passed ? 'passed' : 'failed'}">${result.passed ? '✅ Passed' : '❌ Failed'}</td>
                    </tr>
                `,
                  )
                  .join('')}
            </tbody>
        </table>

        <div class="recommendations">
            <h2>Recommendations</h2>
            <ul>
                ${report.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
            </ul>
        </div>

        <div class="trends">
            <div class="trend-card">
                <h3>Response Time Trend</h3>
                <p class="${report.trends.responseTime}">${report.trends.responseTime.toUpperCase()}</p>
            </div>
            <div class="trend-card">
                <h3>Memory Usage Trend</h3>
                <p class="${report.trends.memoryUsage}">${report.trends.memoryUsage.toUpperCase()}</p>
            </div>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('responseTimeChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(report.results.map((r) => r.name.substring(0, 20) + '...'))},
                datasets: [{
                    label: 'Response Time (ms)',
                    data: ${JSON.stringify(report.results.map((r) => r.metrics.responseTime))},
                    backgroundColor: 'rgba(0, 122, 204, 0.6)',
                    borderColor: 'rgba(0, 122, 204, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>`;

    const filename = 'performance-report.html';
    await fs.writeFile(path.join(this.reportDir, filename), html);
  }

  private async generateMarkdownSummary(report: PerformanceReport): Promise<void> {
    const markdown = `# Performance Report Summary

**Generated:** ${new Date(report.timestamp).toLocaleString()}

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${report.summary.totalTests} |
| Passed | ${report.summary.passed} |
| Failed | ${report.summary.failed} |
| Average Response Time | ${report.summary.averageResponseTime}ms |
| Average Memory Usage | ${report.summary.averageMemoryUsage}MB |

## 📈 Trends

- **Response Time:** ${report.trends.responseTime.toUpperCase()}
- **Memory Usage:** ${report.trends.memoryUsage.toUpperCase()}

## 🔍 Recommendations

${report.recommendations.map((rec) => `- ${rec}`).join('\n')}

## 📋 Detailed Results

| Test Name | Response Time | Memory Usage | LCP | CLS | Status |
|-----------|---------------|--------------|-----|-----|--------|
${report.results
  .map(
    (result) =>
      `| ${result.name} | ${Math.round(result.metrics.responseTime)}ms | ${Math.round(result.metrics.memoryUsage * 100) / 100}MB | ${Math.round(result.metrics.largestContentfulPaint)}ms | ${Math.round(result.metrics.cumulativeLayoutShift * 1000) / 1000} | ${result.passed ? '✅' : '❌'} |`,
  )
  .join('\n')}

---
*Generated by Teaching Engine 2.0 Performance Testing Suite*
`;

    await fs.writeFile(path.join(this.reportDir, 'summary.md'), markdown);
  }

  private async updateHistoricalData(report: PerformanceReport): Promise<void> {
    const historyFile = path.join(this.reportDir, 'historical-data.json');

    let historical: HistoricalData = { reports: [] };

    try {
      const existing = await fs.readFile(historyFile, 'utf-8');
      historical = JSON.parse(existing);
    } catch (_error) {
      // File doesn't exist yet, use empty structure
    }

    historical.reports.push(report);

    // Keep only last 50 reports
    if (historical.reports.length > 50) {
      historical.reports = historical.reports.slice(-50);
    }

    await fs.writeFile(historyFile, JSON.stringify(historical, null, 2));
  }

  private async loadHistoricalData(): Promise<HistoricalData> {
    const historyFile = path.join(this.reportDir, 'historical-data.json');

    try {
      const data = await fs.readFile(historyFile, 'utf-8');
      return JSON.parse(data);
    } catch (_error) {
      return { reports: [] };
    }
  }
}
