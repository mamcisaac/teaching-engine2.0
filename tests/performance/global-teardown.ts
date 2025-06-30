/**
 * Global Teardown for Performance Testing
 * Cleanup and final reporting for performance test environment
 */

import { FullConfig } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up performance testing environment...');

  try {
    // Generate final performance summary report
    await generateFinalReport();

    // Cleanup temporary files
    await cleanupTempFiles();

    // Archive performance results
    await archiveResults();

    console.log('✅ Performance testing cleanup completed');
  } catch (error) {
    console.error('❌ Error during performance testing cleanup:', error);
  }
}

async function generateFinalReport(): Promise<void> {
  const reportDir = 'test-results/performance';
  const finalReportPath = path.join(reportDir, 'final-summary.json');

  try {
    // Collect all performance reports
    const files = await fs.readdir(reportDir);
    const reportFiles = files.filter(
      (file) =>
        file.startsWith('performance-report-') ||
        file.startsWith('visual-report-') ||
        file.startsWith('load-test-report-') ||
        file.startsWith('monitoring-report-') ||
        file.startsWith('memory-report-'),
    );

    const reports = [];
    for (const file of reportFiles) {
      try {
        const content = await fs.readFile(path.join(reportDir, file), 'utf-8');
        const report = JSON.parse(content);
        reports.push({
          type: file.split('-')[0],
          file,
          timestamp: report.timestamp,
          summary: report.summary,
        });
      } catch (error) {
        console.warn(`Could not parse report file ${file}:`, error.message);
      }
    }

    // Generate final summary
    const finalSummary = {
      timestamp: new Date().toISOString(),
      testSession: {
        totalReports: reports.length,
        reportTypes: [...new Set(reports.map((r) => r.type))],
        duration: calculateSessionDuration(reports),
      },
      performanceOverview: {
        benchmarks: reports.filter((r) => r.type === 'performance').length,
        visualTests: reports.filter((r) => r.type === 'visual').length,
        loadTests: reports.filter((r) => r.type === 'load').length,
        monitoringSessions: reports.filter((r) => r.type === 'monitoring').length,
        memoryTests: reports.filter((r) => r.type === 'memory').length,
      },
      keyMetrics: await calculateKeyMetrics(reports),
      recommendations: generateSessionRecommendations(reports),
      files: {
        reports: reportFiles,
        artifacts: await listArtifacts(),
      },
    };

    await fs.writeFile(finalReportPath, JSON.stringify(finalSummary, null, 2));
    console.log(`📊 Final performance summary saved: ${finalReportPath}`);
  } catch (error) {
    console.warn('Could not generate final report:', error.message);
  }
}

function calculateSessionDuration(reports: any[]): string {
  if (reports.length === 0) return '0 minutes';

  const timestamps = reports.map((r) => new Date(r.timestamp).getTime()).filter((t) => !isNaN(t));

  if (timestamps.length < 2) return '< 1 minute';

  const start = Math.min(...timestamps);
  const end = Math.max(...timestamps);
  const durationMinutes = Math.round((end - start) / 60000);

  return `${durationMinutes} minutes`;
}

async function calculateKeyMetrics(reports: any[]): Promise<any> {
  const metrics = {
    averageResponseTime: 0,
    peakMemoryUsage: 0,
    visualRegressions: 0,
    loadTestsPassed: 0,
    alertsGenerated: 0,
  };

  try {
    // Calculate from available summaries
    const performanceReports = reports.filter((r) => r.type === 'performance');
    if (performanceReports.length > 0) {
      const responseTimes = performanceReports
        .map((r) => r.summary?.averageResponseTime)
        .filter((t) => typeof t === 'number');

      if (responseTimes.length > 0) {
        metrics.averageResponseTime = Math.round(
          responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
        );
      }
    }

    const memoryReports = reports.filter((r) => r.type === 'memory');
    if (memoryReports.length > 0) {
      const memoryValues = memoryReports
        .map((r) => r.summary?.peakUsageOverall)
        .filter((m) => typeof m === 'number');

      if (memoryValues.length > 0) {
        metrics.peakMemoryUsage = Math.round(Math.max(...memoryValues));
      }
    }

    const visualReports = reports.filter((r) => r.type === 'visual');
    if (visualReports.length > 0) {
      metrics.visualRegressions = visualReports.reduce(
        (sum, r) => sum + (r.summary?.failed || 0),
        0,
      );
    }

    const loadReports = reports.filter((r) => r.type === 'load');
    metrics.loadTestsPassed = loadReports.filter(
      (r) => r.summary?.passed || r.summary?.totalAlerts === 0,
    ).length;

    const monitoringReports = reports.filter((r) => r.type === 'monitoring');
    metrics.alertsGenerated = monitoringReports.reduce(
      (sum, r) => sum + (r.summary?.totalAlerts || 0),
      0,
    );
  } catch (error) {
    console.warn('Error calculating key metrics:', error.message);
  }

  return metrics;
}

function generateSessionRecommendations(reports: any[]): string[] {
  const recommendations: string[] = [];

  // Analyze reports for patterns
  const visualRegressions = reports.filter((r) => r.type === 'visual' && r.summary?.failed > 0);
  if (visualRegressions.length > 0) {
    recommendations.push(
      '📸 Visual regressions detected. Review UI changes and update baselines if intentional.',
    );
  }

  const memoryIssues = reports.filter((r) => r.type === 'memory' && r.summary?.leaksDetected > 0);
  if (memoryIssues.length > 0) {
    recommendations.push(
      '🧠 Memory leaks detected. Review component lifecycle and event listener cleanup.',
    );
  }

  const performanceIssues = reports.filter(
    (r) =>
      r.type === 'performance' && (r.summary?.failed > 0 || r.summary?.averageResponseTime > 2000),
  );
  if (performanceIssues.length > 0) {
    recommendations.push(
      '⚡ Performance degradation detected. Review recent changes and optimize slow operations.',
    );
  }

  const loadIssues = reports.filter((r) => r.type === 'load' && r.summary?.failed > 0);
  if (loadIssues.length > 0) {
    recommendations.push(
      '🔥 Load testing failures detected. Review system capacity and scaling configuration.',
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      '✅ All performance tests passed successfully. System is performing within expected parameters.',
    );
  }

  return recommendations;
}

async function listArtifacts(): Promise<string[]> {
  const artifactDirs = [
    'test-results/performance-artifacts',
    'test-results/visual',
    'test-results/load-testing',
    'test-results/monitoring',
    'test-results/memory-tracking',
  ];

  const artifacts: string[] = [];

  for (const dir of artifactDirs) {
    try {
      const files = await fs.readdir(dir, { recursive: true });
      artifacts.push(...files.map((file) => `${dir}/${file}`));
    } catch (error) {
      // Directory might not exist, continue
    }
  }

  return artifacts;
}

async function cleanupTempFiles(): Promise<void> {
  const tempFiles = ['test-results/performance-auth.json', 'performance-test.lock'];

  for (const file of tempFiles) {
    try {
      await fs.unlink(file);
      console.log(`🗑️ Cleaned up ${file}`);
    } catch (error) {
      // File might not exist, continue
    }
  }
}

async function archiveResults(): Promise<void> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = `performance-results-${timestamp}`;

    // Create archive directory in project root
    await fs.mkdir(archiveDir, { recursive: true });

    // Copy key reports to archive
    const keyFiles = [
      'test-results/performance/final-summary.json',
      'test-results/performance/baseline.json',
      'test-results/performance/config.json',
    ];

    for (const file of keyFiles) {
      try {
        const content = await fs.readFile(file);
        const filename = path.basename(file);
        await fs.writeFile(path.join(archiveDir, filename), content);
      } catch (error) {
        // File might not exist, continue
      }
    }

    console.log(`📁 Performance results archived to: ${archiveDir}`);
  } catch (error) {
    console.warn('Could not archive results:', error.message);
  }
}

export default globalTeardown;
