#!/usr/bin/env node

/**
 * Test Coverage Report Generator
 * Analyzes and reports on test coverage for critical paths
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CoverageReporter {
  constructor() {
    this.criticalPaths = [
      'src/services/authService.ts',
      'src/routes/auth.ts',
      'src/routes/user.ts',
      'src/middleware/auth.ts',
      'src/middleware/errorHandler.ts',
      'src/services/aiPlanningAssistant.ts',
      'src/services/curriculumImportService.ts',
      'src/services/materialGenerator.ts',
    ];
    
    this.coverageThresholds = {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
    };
  }

  async generateReport() {
    console.log('📊 Generating Test Coverage Report...\n');
    
    try {
      // Run tests with coverage
      console.log('Running tests with coverage...');
      execSync('pnpm test:coverage', { 
        stdio: 'inherit',
        env: { ...process.env, CI: 'true' }
      });
      
      // Read coverage summary
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      if (!fs.existsSync(coveragePath)) {
        throw new Error('Coverage summary not found. Make sure tests ran successfully.');
      }
      
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      
      // Generate report
      this.printOverallCoverage(coverage.total);
      this.printCriticalPathCoverage(coverage);
      this.printUncoveredFiles(coverage);
      this.printRecommendations(coverage);
      
    } catch (error) {
      console.error('❌ Failed to generate coverage report:', error.message);
      process.exit(1);
    }
  }
  
  printOverallCoverage(total) {
    console.log('\n📈 Overall Coverage:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const metrics = ['lines', 'statements', 'functions', 'branches'];
    metrics.forEach(metric => {
      const pct = total[metric].pct;
      const status = pct >= this.coverageThresholds[metric] ? '✅' : '⚠️';
      const bar = this.generateProgressBar(pct);
      
      console.log(`${status} ${metric.padEnd(12)}: ${bar} ${pct.toFixed(2)}%`);
    });
  }
  
  printCriticalPathCoverage(coverage) {
    console.log('\n🎯 Critical Path Coverage:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const criticalCoverage = [];
    
    Object.entries(coverage).forEach(([filePath, data]) => {
      if (filePath === 'total') return;
      
      const relativePath = path.relative(process.cwd(), filePath);
      if (this.criticalPaths.some(critical => relativePath.includes(critical))) {
        criticalCoverage.push({
          path: relativePath,
          lines: data.lines.pct,
          functions: data.functions.pct,
          branches: data.branches.pct,
          statements: data.statements.pct,
        });
      }
    });
    
    // Sort by lowest coverage
    criticalCoverage.sort((a, b) => {
      const aMin = Math.min(a.lines, a.functions, a.branches, a.statements);
      const bMin = Math.min(b.lines, b.functions, b.branches, b.statements);
      return aMin - bMin;
    });
    
    criticalCoverage.forEach(file => {
      const minCoverage = Math.min(file.lines, file.functions, file.branches, file.statements);
      const status = minCoverage >= 90 ? '✅' : minCoverage >= 80 ? '⚠️' : '❌';
      
      console.log(`\n${status} ${file.path}`);
      console.log(`   Lines: ${file.lines.toFixed(2)}% | Functions: ${file.functions.toFixed(2)}% | Branches: ${file.branches.toFixed(2)}% | Statements: ${file.statements.toFixed(2)}%`);
    });
  }
  
  printUncoveredFiles(coverage) {
    console.log('\n❌ Files with Low Coverage (<80%):');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const lowCoverageFiles = [];
    
    Object.entries(coverage).forEach(([filePath, data]) => {
      if (filePath === 'total') return;
      
      const avgCoverage = (data.lines.pct + data.functions.pct + data.branches.pct + data.statements.pct) / 4;
      if (avgCoverage < 80) {
        lowCoverageFiles.push({
          path: path.relative(process.cwd(), filePath),
          coverage: avgCoverage,
          lines: data.lines,
        });
      }
    });
    
    if (lowCoverageFiles.length === 0) {
      console.log('   ✅ All files meet minimum coverage requirements!');
    } else {
      lowCoverageFiles
        .sort((a, b) => a.coverage - b.coverage)
        .slice(0, 10)
        .forEach(file => {
          console.log(`   ${file.path}: ${file.coverage.toFixed(2)}% (${file.lines.covered}/${file.lines.total} lines)`);
        });
    }
  }
  
  printRecommendations(coverage) {
    console.log('\n💡 Recommendations:');
    console.log('═══════════════════════════════════════════════════════════════════');
    
    const total = coverage.total;
    const recommendations = [];
    
    // Check each metric
    if (total.branches.pct < this.coverageThresholds.branches) {
      recommendations.push('• Add tests for conditional logic and edge cases (branch coverage)');
    }
    
    if (total.functions.pct < this.coverageThresholds.functions) {
      recommendations.push('• Ensure all exported functions have at least one test');
    }
    
    if (total.lines.pct < this.coverageThresholds.lines) {
      recommendations.push('• Focus on testing error handling and exception paths');
    }
    
    // Check critical paths
    const criticalGaps = [];
    Object.entries(coverage).forEach(([filePath, data]) => {
      const relativePath = path.relative(process.cwd(), filePath);
      if (this.criticalPaths.some(critical => relativePath.includes(critical))) {
        if (data.lines.pct < 90) {
          criticalGaps.push(relativePath);
        }
      }
    });
    
    if (criticalGaps.length > 0) {
      recommendations.push(`• Critical files need attention: ${criticalGaps.slice(0, 3).join(', ')}`);
    }
    
    if (recommendations.length === 0) {
      console.log('   ✅ Excellent coverage! Keep up the good work!');
    } else {
      recommendations.forEach(rec => console.log(rec));
    }
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Run "pnpm test:coverage" to update coverage');
    console.log('   2. Open coverage/lcov-report/index.html for detailed report');
    console.log('   3. Focus on files with <90% coverage in critical paths');
    console.log('   4. Add tests for uncovered branches and error cases');
  }
  
  generateProgressBar(percentage) {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    const filledChar = '█';
    const emptyChar = '░';
    
    return `[${filledChar.repeat(filled)}${emptyChar.repeat(empty)}]`;
  }
}

// Run if called directly
if (require.main === module) {
  new CoverageReporter().generateReport();
}

module.exports = { CoverageReporter };