import type { Reporter, Test, TestResult, AggregatedResult, Context, ReporterOnStartOptions } from '@jest/reporters';
import { promises as fs } from 'fs';
import path from 'path';

interface TestReporterOptions {
  outputDirectory?: string;
  includeConsoleOutput?: boolean;
  reportTitle?: string;
}

interface TestExecutionDetails {
  name: string;
  path: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  failureReason?: string;
  retries?: number;
  memory?: number;
}

export default class TeachingEngineTestReporter implements Reporter {
  private options: TestReporterOptions;
  private startTime: number = 0;
  private testResults: TestExecutionDetails[] = [];
  private globalConfig: unknown;

  constructor(globalConfig: unknown, options: TestReporterOptions = {}) {
    this.globalConfig = globalConfig;
    this.options = {
      outputDirectory: options.outputDirectory || 'test-results',
      includeConsoleOutput: options.includeConsoleOutput ?? true,
      reportTitle: options.reportTitle || 'Test Execution Report',
    };
  }

  onRunStart(results: AggregatedResult, options: ReporterOnStartOptions): void {
    this.startTime = Date.now();
    console.log(`\n🚀 Starting test run with ${options.estimatedTime || 'unknown'} estimated time`);
    console.log(`📁 Test files: ${results.numTotalTestSuites}`);
  }

  onTestResult(test: Test, testResult: TestResult): void {
    const { testFilePath, testResults } = testResult;
    
    testResults.forEach((result) => {
      const testDetails: TestExecutionDetails = {
        name: result.fullName,
        path: path.relative(process.cwd(), testFilePath),
        duration: result.duration || 0,
        status: result.status as 'passed' | 'failed' | 'skipped',
        failureReason: result.failureMessages?.join('\n'),
        memory: process.memoryUsage().heapUsed,
      };
      
      // Extract retry information from test name or console output
      if (testResult.console && this.options.includeConsoleOutput) {
        const retryMatch = testResult.console.find(log => 
          log.message.includes('passed after') && log.message.includes('retries')
        );
        if (retryMatch) {
          const retries = parseInt(retryMatch.message.match(/after (\d+) retries/)?.[1] || '0');
          testDetails.retries = retries;
        }
      }
      
      this.testResults.push(testDetails);
    });
    
    // Print progress
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    const skipped = testResults.filter(t => t.status === 'skipped').length;
    
    const icon = failed > 0 ? '❌' : passed > 0 ? '✅' : '⏭️';
    console.log(`${icon} ${path.basename(testFilePath)}: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  }

  async onRunComplete(contexts: Set<Context>, results: AggregatedResult): Promise<void> {
    const totalDuration = Date.now() - this.startTime;
    
    // Generate summary
    const summary = {
      title: this.options.reportTitle,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      environment: {
        node: process.version,
        platform: process.platform,
        ci: process.env.CI === 'true',
        workers: this.globalConfig.maxWorkers,
      },
      totals: {
        suites: results.numTotalTestSuites,
        tests: results.numTotalTests,
        passed: results.numPassedTests,
        failed: results.numFailedTests,
        skipped: results.numPendingTests,
        todo: results.numTodoTests,
      },
      performance: {
        slowestTests: this.getPerformanceMetrics().slowest,
        averageDuration: this.getPerformanceMetrics().average,
        totalDuration: totalDuration,
      },
      failures: this.testResults
        .filter(t => t.status === 'failed')
        .map(t => ({
          name: t.name,
          path: t.path,
          reason: t.failureReason?.split('\n')[0], // First line only
        })),
      flaky: this.testResults
        .filter(t => t.retries && t.retries > 0)
        .map(t => ({
          name: t.name,
          retries: t.retries,
          duration: t.duration,
        })),
    };
    
    // Write detailed report
    await this.writeReport(summary);
    
    // Print console summary
    this.printSummary(summary);
  }

  private getPerformanceMetrics() {
    const durations = this.testResults.map(t => t.duration);
    
    return {
      slowest: this.testResults
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .map(t => ({
          name: t.name,
          duration: t.duration,
          path: t.path,
        })),
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
    };
  }

  private async writeReport(summary: any): Promise<void> {
    const outputDir = path.resolve(this.options.outputDirectory);
    
    // Ensure directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Write JSON report
    const jsonPath = path.join(outputDir, 'test-report.json');
    await fs.writeFile(jsonPath, JSON.stringify(summary, null, 2));
    
    // Write HTML report
    const htmlPath = path.join(outputDir, 'test-report.html');
    await fs.writeFile(htmlPath, this.generateHtmlReport(summary));
    
    // Write JUnit XML for CI integration
    const xmlPath = path.join(outputDir, 'junit.xml');
    await fs.writeFile(xmlPath, this.generateJUnitXml(summary));
    
    console.log(`\n📊 Test reports written to ${outputDir}`);
  }

  private generateHtmlReport(summary: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${summary.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #fff; border: 1px solid #ddd; border-radius: 3px; }
        .passed { color: green; }
        .failed { color: red; }
        .skipped { color: gray; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .failure { background: #fee; }
        .flaky { background: #ffa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${summary.title}</h1>
        <p>Generated: ${new Date(summary.timestamp).toLocaleString()}</p>
        <p>Duration: ${(summary.duration / 1000).toFixed(2)}s</p>
        <p>Environment: Node ${summary.environment.node} on ${summary.environment.platform} ${summary.environment.ci ? '(CI)' : '(Local)'}</p>
    </div>
    
    <h2>Test Summary</h2>
    <div>
        <div class="metric">
            <strong>Total Tests:</strong> ${summary.totals.tests}
        </div>
        <div class="metric passed">
            <strong>Passed:</strong> ${summary.totals.passed}
        </div>
        <div class="metric failed">
            <strong>Failed:</strong> ${summary.totals.failed}
        </div>
        <div class="metric skipped">
            <strong>Skipped:</strong> ${summary.totals.skipped}
        </div>
    </div>
    
    ${summary.failures.length > 0 ? `
        <h2>Failures</h2>
        <table>
            <tr><th>Test</th><th>File</th><th>Reason</th></tr>
            ${summary.failures.map(f => `
                <tr class="failure">
                    <td>${f.name}</td>
                    <td>${f.path}</td>
                    <td>${this.escapeHtml(f.reason || 'Unknown')}</td>
                </tr>
            `).join('')}
        </table>
    ` : ''}
    
    ${summary.flaky.length > 0 ? `
        <h2>Flaky Tests (Required Retries)</h2>
        <table>
            <tr><th>Test</th><th>Retries</th><th>Duration</th></tr>
            ${summary.flaky.map(f => `
                <tr class="flaky">
                    <td>${f.name}</td>
                    <td>${f.retries}</td>
                    <td>${f.duration}ms</td>
                </tr>
            `).join('')}
        </table>
    ` : ''}
    
    <h2>Performance</h2>
    <p>Average test duration: ${summary.performance.averageDuration.toFixed(2)}ms</p>
    <table>
        <tr><th>Slowest Tests</th><th>Duration</th><th>File</th></tr>
        ${summary.performance.slowestTests.map(t => `
            <tr>
                <td>${t.name}</td>
                <td>${t.duration}ms</td>
                <td>${t.path}</td>
            </tr>
        `).join('')}
    </table>
</body>
</html>
    `;
  }

  private generateJUnitXml(summary: any): string {
    const testcases = this.testResults.map(test => {
      const attrs = [
        `name="${this.escapeXml(test.name)}"`,
        `classname="${this.escapeXml(test.path)}"`,
        `time="${(test.duration / 1000).toFixed(3)}"`,
      ].join(' ');
      
      if (test.status === 'failed') {
        return `
        <testcase ${attrs}>
            <failure message="${this.escapeXml(test.failureReason?.split('\n')[0] || 'Test failed')}">
                ${this.escapeXml(test.failureReason || '')}
            </failure>
        </testcase>`;
      } else if (test.status === 'skipped') {
        return `
        <testcase ${attrs}>
            <skipped/>
        </testcase>`;
      } else {
        return `<testcase ${attrs}/>`;
      }
    }).join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="${this.escapeXml(summary.title)}" tests="${summary.totals.tests}" failures="${summary.totals.failed}" skipped="${summary.totals.skipped}" time="${(summary.duration / 1000).toFixed(3)}">
    <testsuite name="Teaching Engine Tests" tests="${summary.totals.tests}" failures="${summary.totals.failed}" skipped="${summary.totals.skipped}" time="${(summary.duration / 1000).toFixed(3)}">
        ${testcases}
    </testsuite>
</testsuites>`;
  }

  private printSummary(summary: any): void {
    console.log('\n' + '='.repeat(80));
    console.log(`📋 ${summary.title}`);
    console.log('='.repeat(80));
    
    const passRate = ((summary.totals.passed / summary.totals.tests) * 100).toFixed(1);
    console.log(`\n✨ Test Results:`);
    console.log(`   Total: ${summary.totals.tests} tests in ${summary.totals.suites} suites`);
    console.log(`   ✅ Passed: ${summary.totals.passed} (${passRate}%)`);
    
    if (summary.totals.failed > 0) {
      console.log(`   ❌ Failed: ${summary.totals.failed}`);
      console.log('\n❌ Failed Tests:');
      summary.failures.forEach((f: any) => {
        console.log(`   - ${f.name}`);
        console.log(`     ${f.path}`);
        console.log(`     ${f.reason}`);
      });
    }
    
    if (summary.flaky.length > 0) {
      console.log(`\n⚠️  Flaky Tests (${summary.flaky.length}):`);
      summary.flaky.forEach((f: any) => {
        console.log(`   - ${f.name} (${f.retries} retries)`);
      });
    }
    
    console.log(`\n⏱️  Performance:`);
    console.log(`   Total time: ${(summary.duration / 1000).toFixed(2)}s`);
    console.log(`   Avg test time: ${summary.performance.averageDuration.toFixed(0)}ms`);
    
    if (summary.performance.slowestTests.length > 0) {
      console.log(`\n🐌 Slowest tests:`);
      summary.performance.slowestTests.slice(0, 5).forEach((t: any) => {
        console.log(`   - ${t.name}: ${t.duration}ms`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private escapeXml(str: string): string {
    return this.escapeHtml(str);
  }
}