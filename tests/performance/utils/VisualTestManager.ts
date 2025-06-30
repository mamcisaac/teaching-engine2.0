/**
 * Visual Test Manager
 * Manages visual regression testing, screenshot comparison, and reporting
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { VisualTestResult } from '../visual-regression.spec';

interface VisualReport {
  timestamp: string;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    regressionRate: number;
  };
  results: VisualTestResult[];
  recommendations: string[];
  baseline: {
    created: string;
    updated: string;
    version: string;
  };
}

export class VisualTestManager {
  private baselineDir: string;
  private reportDir: string;
  private diffDir: string;

  constructor() {
    this.baselineDir = path.join(process.cwd(), 'test-results', 'visual', 'baseline');
    this.reportDir = path.join(process.cwd(), 'test-results', 'visual', 'reports');
    this.diffDir = path.join(process.cwd(), 'test-results', 'visual', 'diffs');
  }

  async generateReport(results: VisualTestResult[]): Promise<void> {
    await this.ensureDirectories();

    const report: VisualReport = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(results),
      results,
      recommendations: this.generateRecommendations(results),
      baseline: await this.getBaselineInfo(),
    };

    // Save detailed JSON report
    await this.saveJSONReport(report);

    // Generate HTML report with image comparisons
    await this.generateHTMLReport(report);

    // Generate markdown summary
    await this.generateMarkdownSummary(report);

    console.log(`📸 Visual regression report generated: ${this.reportDir}`);
  }

  private generateSummary(results: VisualTestResult[]) {
    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;
    const regressionRate = results.length > 0 ? (failed / results.length) * 100 : 0;

    return {
      totalTests: results.length,
      passed,
      failed,
      regressionRate: Math.round(regressionRate * 100) / 100,
    };
  }

  private generateRecommendations(results: VisualTestResult[]): string[] {
    const recommendations: string[] = [];
    const failed = results.filter((r) => !r.passed);

    if (failed.length === 0) {
      recommendations.push('✅ All visual tests passed! UI is consistent across viewports.');
      return recommendations;
    }

    // Analyze failure patterns
    const mobileFailures = failed.filter((r) => r.viewport === 'mobile');
    const tabletFailures = failed.filter((r) => r.viewport === 'tablet');
    const desktopFailures = failed.filter((r) => r.viewport === 'desktop');

    if (mobileFailures.length > 0) {
      recommendations.push(
        `📱 ${mobileFailures.length} mobile visual regressions detected. Review responsive design.`,
      );
    }

    if (tabletFailures.length > 0) {
      recommendations.push(
        `📲 ${tabletFailures.length} tablet visual regressions detected. Check medium screen layouts.`,
      );
    }

    if (desktopFailures.length > 0) {
      recommendations.push(
        `🖥️ ${desktopFailures.length} desktop visual regressions detected. Review desktop layouts.`,
      );
    }

    // Check for high pixel differences
    const highDiffTests = failed.filter((r) => r.diffPixels && r.diffPixels > 1000);
    if (highDiffTests.length > 0) {
      recommendations.push(
        `🔍 ${highDiffTests.length} tests have significant visual changes (>1000 pixels). Review major UI changes.`,
      );
    }

    // Check for consistent failures across pages
    const pageFailures = failed.reduce(
      (acc, r) => {
        acc[r.pageName] = (acc[r.pageName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const problematicPages = Object.entries(pageFailures)
      .filter(([_, count]) => count >= 2)
      .map(([page]) => page);

    if (problematicPages.length > 0) {
      recommendations.push(
        `🎯 Pages with multiple regressions: ${problematicPages.join(', ')}. Prioritize these for review.`,
      );
    }

    recommendations.push('💡 Consider updating baseline images if changes are intentional.');
    recommendations.push(
      '🔧 Review recent CSS/component changes that might affect visual appearance.',
    );

    return recommendations;
  }

  private async getBaselineInfo(): Promise<VisualReport['baseline']> {
    try {
      const baselineInfoPath = path.join(this.baselineDir, 'info.json');
      const data = await fs.readFile(baselineInfoPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: '1.0.0',
      };
    }
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.baselineDir, { recursive: true });
    await fs.mkdir(this.reportDir, { recursive: true });
    await fs.mkdir(this.diffDir, { recursive: true });
  }

  private async saveJSONReport(report: VisualReport): Promise<void> {
    const filename = `visual-report-${Date.now()}.json`;
    const filepath = path.join(this.reportDir, filename);

    await fs.writeFile(filepath, JSON.stringify(report, null, 2));

    // Also save as latest
    const latestPath = path.join(this.reportDir, 'latest.json');
    await fs.writeFile(latestPath, JSON.stringify(report, null, 2));
  }

  private async generateHTMLReport(report: VisualReport): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Regression Report - Teaching Engine 2.0</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
            line-height: 1.6;
        }
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 0; 
            border-bottom: 1px solid #e9ecef;
        }
        .metric-card { 
            padding: 30px; 
            text-align: center; 
            border-right: 1px solid #e9ecef;
        }
        .metric-card:last-child { border-right: none; }
        .metric-value { 
            font-size: 2.5em; 
            font-weight: bold; 
            margin-bottom: 5px;
        }
        .metric-label { 
            color: #6c757d; 
            text-transform: uppercase; 
            font-size: 0.85em; 
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .passed .metric-value { color: #28a745; }
        .failed .metric-value { color: #dc3545; }
        .total .metric-value { color: #007acc; }
        .rate .metric-value { color: #fd7e14; }
        
        .content { padding: 30px; }
        .section { margin-bottom: 40px; }
        .section h2 { 
            color: #495057; 
            border-bottom: 2px solid #e9ecef; 
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .recommendations { 
            background: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px; 
        }
        .recommendations h3 { 
            color: #856404; 
            margin-top: 0; 
        }
        .recommendations ul { 
            margin-bottom: 0; 
        }
        .recommendations li { 
            margin-bottom: 8px; 
        }
        
        .results-grid { 
            display: grid; 
            gap: 20px; 
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        }
        .result-card { 
            border: 1px solid #dee2e6; 
            border-radius: 8px; 
            overflow: hidden; 
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .result-card:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
        }
        .result-card.passed { border-left: 4px solid #28a745; }
        .result-card.failed { border-left: 4px solid #dc3545; }
        
        .result-header { 
            padding: 15px 20px; 
            background: #f8f9fa; 
            border-bottom: 1px solid #dee2e6;
        }
        .result-title { 
            font-weight: bold; 
            margin: 0; 
            color: #495057;
        }
        .result-viewport { 
            color: #6c757d; 
            font-size: 0.9em; 
            margin: 5px 0 0;
        }
        .result-status { 
            float: right; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 0.8em; 
            font-weight: bold;
        }
        .result-status.passed { 
            background: #d4edda; 
            color: #155724; 
        }
        .result-status.failed { 
            background: #f8d7da; 
            color: #721c24; 
        }
        
        .result-body { padding: 20px; }
        .result-details { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 15px;
        }
        .result-detail { 
            text-align: center; 
            padding: 10px; 
            background: #f8f9fa; 
            border-radius: 6px;
        }
        .result-detail-value { 
            font-weight: bold; 
            font-size: 1.2em; 
            color: #495057;
        }
        .result-detail-label { 
            color: #6c757d; 
            font-size: 0.85em; 
            margin-top: 2px;
        }
        
        .screenshot-container { 
            text-align: center; 
            margin-top: 15px;
        }
        .screenshot { 
            max-width: 100%; 
            height: auto; 
            border: 1px solid #dee2e6; 
            border-radius: 6px;
        }
        
        .baseline-info { 
            background: #e7f3ff; 
            border-left: 4px solid #007acc; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px;
        }
        .baseline-info h3 { 
            color: #0056b3; 
            margin-top: 0; 
        }
        
        .filter-buttons {
            margin-bottom: 20px;
            text-align: center;
        }
        .filter-btn {
            padding: 8px 16px;
            margin: 0 5px;
            border: 1px solid #007acc;
            background: white;
            color: #007acc;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .filter-btn:hover, .filter-btn.active {
            background: #007acc;
            color: white;
        }
        
        @media (max-width: 768px) {
            .results-grid { 
                grid-template-columns: 1fr; 
            }
            .summary { 
                grid-template-columns: 1fr 1fr; 
            }
            .result-details { 
                grid-template-columns: 1fr; 
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Visual Regression Report</h1>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="metric-card total">
                <div class="metric-value">${report.summary.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric-card passed">
                <div class="metric-value">${report.summary.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric-card failed">
                <div class="metric-value">${report.summary.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric-card rate">
                <div class="metric-value">${report.summary.regressionRate}%</div>
                <div class="metric-label">Regression Rate</div>
            </div>
        </div>

        <div class="content">
            <div class="baseline-info">
                <h3>📊 Baseline Information</h3>
                <p><strong>Created:</strong> ${new Date(report.baseline.created).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> ${new Date(report.baseline.updated).toLocaleString()}</p>
                <p><strong>Version:</strong> ${report.baseline.version}</p>
            </div>

            <div class="recommendations">
                <h3>💡 Recommendations</h3>
                <ul>
                    ${report.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h2>📸 Test Results</h2>
                
                <div class="filter-buttons">
                    <button class="filter-btn active" onclick="filterResults('all')">All</button>
                    <button class="filter-btn" onclick="filterResults('passed')">Passed</button>
                    <button class="filter-btn" onclick="filterResults('failed')">Failed</button>
                    <button class="filter-btn" onclick="filterResults('mobile')">Mobile</button>
                    <button class="filter-btn" onclick="filterResults('tablet')">Tablet</button>
                    <button class="filter-btn" onclick="filterResults('desktop')">Desktop</button>
                </div>

                <div class="results-grid" id="results-grid">
                    ${report.results
                      .map(
                        (result) => `
                        <div class="result-card ${result.passed ? 'passed' : 'failed'}" 
                             data-status="${result.passed ? 'passed' : 'failed'}" 
                             data-viewport="${result.viewport}">
                            <div class="result-header">
                                <div class="result-title">${result.pageName}</div>
                                <div class="result-viewport">${result.viewport}</div>
                                <div class="result-status ${result.passed ? 'passed' : 'failed'}">
                                    ${result.passed ? '✅ Passed' : '❌ Failed'}
                                </div>
                            </div>
                            <div class="result-body">
                                ${
                                  !result.passed && result.diffPixels
                                    ? `
                                    <div class="result-details">
                                        <div class="result-detail">
                                            <div class="result-detail-value">${result.diffPixels}</div>
                                            <div class="result-detail-label">Diff Pixels</div>
                                        </div>
                                        <div class="result-detail">
                                            <div class="result-detail-value">${result.diffPercentage?.toFixed(2) || 'N/A'}%</div>
                                            <div class="result-detail-label">Diff Percentage</div>
                                        </div>
                                    </div>
                                `
                                    : ''
                                }
                                ${
                                  result.screenshotPath
                                    ? `
                                    <div class="screenshot-container">
                                        <img src="${result.screenshotPath}" alt="Screenshot" class="screenshot">
                                    </div>
                                `
                                    : ''
                                }
                            </div>
                        </div>
                    `,
                      )
                      .join('')}
                </div>
            </div>
        </div>
    </div>

    <script>
        function filterResults(filter) {
            const grid = document.getElementById('results-grid');
            const cards = grid.querySelectorAll('.result-card');
            const buttons = document.querySelectorAll('.filter-btn');
            
            // Update active button
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Filter cards
            cards.forEach(card => {
                const status = card.dataset.status;
                const viewport = card.dataset.viewport;
                
                let show = false;
                switch(filter) {
                    case 'all': show = true; break;
                    case 'passed': show = status === 'passed'; break;
                    case 'failed': show = status === 'failed'; break;
                    case 'mobile': show = viewport === 'mobile'; break;
                    case 'tablet': show = viewport === 'tablet'; break;
                    case 'desktop': show = viewport === 'desktop'; break;
                }
                
                card.style.display = show ? 'block' : 'none';
            });
        }
    </script>
</body>
</html>`;

    const filename = 'visual-report.html';
    await fs.writeFile(path.join(this.reportDir, filename), html);
  }

  private async generateMarkdownSummary(report: VisualReport): Promise<void> {
    const markdown = `# Visual Regression Report Summary

**Generated:** ${new Date(report.timestamp).toLocaleString()}

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${report.summary.totalTests} |
| Passed | ${report.summary.passed} |
| Failed | ${report.summary.failed} |
| Regression Rate | ${report.summary.regressionRate}% |

## 📸 Baseline Information

- **Created:** ${new Date(report.baseline.created).toLocaleString()}
- **Last Updated:** ${new Date(report.baseline.updated).toLocaleString()}
- **Version:** ${report.baseline.version}

## 💡 Recommendations

${report.recommendations.map((rec) => `- ${rec}`).join('\n')}

## 📋 Detailed Results

| Page | Viewport | Status | Diff Pixels | Diff % |
|------|----------|--------|-------------|--------|
${report.results
  .map(
    (result) =>
      `| ${result.pageName} | ${result.viewport} | ${result.passed ? '✅' : '❌'} | ${result.diffPixels || 'N/A'} | ${result.diffPercentage?.toFixed(2) || 'N/A'}% |`,
  )
  .join('\n')}

---
*Generated by Teaching Engine 2.0 Visual Testing Suite*
`;

    await fs.writeFile(path.join(this.reportDir, 'visual-summary.md'), markdown);
  }

  async updateBaseline(version: string): Promise<void> {
    const baselineInfo = {
      created: (await this.getBaselineInfo()).created,
      updated: new Date().toISOString(),
      version,
    };

    const baselineInfoPath = path.join(this.baselineDir, 'info.json');
    await fs.writeFile(baselineInfoPath, JSON.stringify(baselineInfo, null, 2));

    console.log(`📸 Baseline updated to version ${version}`);
  }

  async createBaseline(version: string = '1.0.0'): Promise<void> {
    await this.ensureDirectories();

    const baselineInfo = {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      version,
    };

    const baselineInfoPath = path.join(this.baselineDir, 'info.json');
    await fs.writeFile(baselineInfoPath, JSON.stringify(baselineInfo, null, 2));

    console.log(`📸 New baseline created with version ${version}`);
  }
}
