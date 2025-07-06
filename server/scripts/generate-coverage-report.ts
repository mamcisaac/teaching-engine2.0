#!/usr/bin/env tsx
/**
 * Generate Coverage Report
 * 
 * This script generates a detailed coverage report
 */

import * as fs from 'fs';
import * as path from 'path';

interface FileCoverage {
  path: string;
  statementsCovered: number;
  statementsTotal: number;
  branchesCovered: number;
  branchesTotal: number;
  functionsCovered: number;
  functionsTotal: number;
  linesCovered: number;
  linesTotal: number;
}

async function generateCoverageReport(): Promise<void> {
  console.log('📈 Generating coverage report...\n');

  const coverageDir = path.join(process.cwd(), 'coverage');
  const reportDir = path.join(process.cwd(), 'coverage-reports');

  // Create report directory
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Check for coverage data
  if (!fs.existsSync(coverageDir)) {
    console.log('❌ No coverage data found. Run tests with coverage first.');
    process.exit(1);
  }

  // Read coverage summary
  const summaryFile = path.join(coverageDir, 'coverage-summary.json');
  if (!fs.existsSync(summaryFile)) {
    console.log('❌ Coverage summary not found.');
    process.exit(1);
  }

  const coverageData = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));

  // Generate HTML report
  const htmlReport = generateHTMLReport(coverageData);
  const htmlFile = path.join(reportDir, 'coverage-report.html');
  fs.writeFileSync(htmlFile, htmlReport);

  // Generate markdown report
  const markdownReport = generateMarkdownReport(coverageData);
  const mdFile = path.join(reportDir, 'coverage-report.md');
  fs.writeFileSync(mdFile, markdownReport);

  // Generate JSON summary
  const jsonSummary = {
    timestamp: new Date().toISOString(),
    summary: coverageData.total,
    files: Object.entries(coverageData)
      .filter(([key]) => key !== 'total')
      .map(([path, data]: [string, any]) => ({
        path,
        statements: data.statements.pct,
        branches: data.branches.pct,
        functions: data.functions.pct,
        lines: data.lines.pct
      }))
      .sort((a, b) => a.lines - b.lines)
      .slice(0, 20) // Top 20 least covered files
  };

  const jsonFile = path.join(reportDir, `coverage-summary-${Date.now()}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(jsonSummary, null, 2));

  console.log('📊 Coverage Report Summary:');
  console.log(`Statements: ${coverageData.total.statements.pct.toFixed(2)}%`);
  console.log(`Branches: ${coverageData.total.branches.pct.toFixed(2)}%`);
  console.log(`Functions: ${coverageData.total.functions.pct.toFixed(2)}%`);
  console.log(`Lines: ${coverageData.total.lines.pct.toFixed(2)}%`);

  console.log('\n📁 Files with lowest coverage:');
  jsonSummary.files.slice(0, 5).forEach(file => {
    console.log(`- ${file.path}: ${file.lines.toFixed(2)}%`);
  });

  console.log(`\n✅ Coverage reports generated:`);
  console.log(`- HTML: ${htmlFile}`);
  console.log(`- Markdown: ${mdFile}`);
  console.log(`- JSON: ${jsonFile}`);
}

function generateHTMLReport(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Coverage Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .good { color: green; }
    .warning { color: orange; }
    .bad { color: red; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>Test Coverage Report</h1>
  <div class="summary">
    <h2>Overall Coverage</h2>
    <div class="metric">Statements: <span class="${getCoverageClass(data.total.statements.pct)}">${data.total.statements.pct.toFixed(2)}%</span></div>
    <div class="metric">Branches: <span class="${getCoverageClass(data.total.branches.pct)}">${data.total.branches.pct.toFixed(2)}%</span></div>
    <div class="metric">Functions: <span class="${getCoverageClass(data.total.functions.pct)}">${data.total.functions.pct.toFixed(2)}%</span></div>
    <div class="metric">Lines: <span class="${getCoverageClass(data.total.lines.pct)}">${data.total.lines.pct.toFixed(2)}%</span></div>
  </div>
  <p>Generated: ${new Date().toLocaleString()}</p>
</body>
</html>
  `;
}

function generateMarkdownReport(data: any): string {
  return `# Test Coverage Report

Generated: ${new Date().toLocaleString()}

## Overall Coverage

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | ${data.total.statements.pct.toFixed(2)}% | ${getCoverageEmoji(data.total.statements.pct)} |
| Branches | ${data.total.branches.pct.toFixed(2)}% | ${getCoverageEmoji(data.total.branches.pct)} |
| Functions | ${data.total.functions.pct.toFixed(2)}% | ${getCoverageEmoji(data.total.functions.pct)} |
| Lines | ${data.total.lines.pct.toFixed(2)}% | ${getCoverageEmoji(data.total.lines.pct)} |

## Coverage Thresholds

- ✅ Statements: 90%
- ✅ Branches: 85%
- ✅ Functions: 85%
- ✅ Lines: 90%
`;
}

function getCoverageClass(pct: number): string {
  if (pct >= 90) return 'good';
  if (pct >= 80) return 'warning';
  return 'bad';
}

function getCoverageEmoji(pct: number): string {
  if (pct >= 90) return '✅';
  if (pct >= 80) return '⚠️';
  return '❌';
}

// Run report generation
generateCoverageReport().catch(error => {
  console.error('❌ Coverage report generation failed:', error);
  process.exit(1);
});