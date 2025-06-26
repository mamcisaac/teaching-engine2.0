/**
 * Test Results Categorizer
 * Categorizes test results by feature area for better reporting
 */

module.exports = (testResults) => {
  const categories = {
    'ETFO Planning': {
      patterns: ['etfo', 'lesson-plan', 'unit-plan', 'long-range', 'daybook'],
      tests: [],
      passed: 0,
      failed: 0,
      total: 0,
    },
    'Curriculum Management': {
      patterns: ['curriculum', 'expectation', 'import'],
      tests: [],
      passed: 0,
      failed: 0,
      total: 0,
    },
    'AI Services': {
      patterns: ['ai', 'llm', 'embedding', 'clustering'],
      tests: [],
      passed: 0,
      failed: 0,
      total: 0,
    },
    'Reporting & Analytics': {
      patterns: ['report', 'analytics', 'progress'],
      tests: [],
      passed: 0,
      failed: 0,
      total: 0,
    },
    'Core Infrastructure': {
      patterns: ['auth', 'validation', 'database', 'prisma'],
      tests: [],
      passed: 0,
      failed: 0,
      total: 0,
    },
    'API Endpoints': {
      patterns: ['routes', 'api', 'endpoints'],
      tests: [],
      passed: 0,
      failed: 0,
      total: 0,
    },
  };

  // Categorize test results
  testResults.testResults.forEach((testFileResult) => {
    const filePath = testFileResult.testFilePath;
    const fileName = filePath.split('/').pop();
    
    testFileResult.testResults.forEach((testResult) => {
      let categorized = false;
      
      for (const [categoryName, category] of Object.entries(categories)) {
        const matchesCategory = category.patterns.some(pattern => 
          fileName.toLowerCase().includes(pattern.toLowerCase()) ||
          testResult.fullName.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (matchesCategory && !categorized) {
          category.tests.push({
            file: fileName,
            name: testResult.fullName,
            status: testResult.status,
            duration: testResult.duration,
            failureMessages: testResult.failureMessages,
          });
          
          category.total++;
          if (testResult.status === 'passed') {
            category.passed++;
          } else {
            category.failed++;
          }
          
          categorized = true;
          break;
        }
      }
      
      // If not categorized, add to 'Other'
      if (!categorized) {
        if (!categories['Other']) {
          categories['Other'] = {
            patterns: [],
            tests: [],
            passed: 0,
            failed: 0,
            total: 0,
          };
        }
        
        categories['Other'].tests.push({
          file: fileName,
          name: testResult.fullName,
          status: testResult.status,
          duration: testResult.duration,
          failureMessages: testResult.failureMessages,
        });
        
        categories['Other'].total++;
        if (testResult.status === 'passed') {
          categories['Other'].passed++;
        } else {
          categories['Other'].failed++;
        }
      }
    });
  });

  // Generate categorized summary
  console.log('\n📊 Test Results by Category:');
  console.log('=' .repeat(60));
  
  for (const [categoryName, category] of Object.entries(categories)) {
    if (category.total > 0) {
      const passRate = ((category.passed / category.total) * 100).toFixed(1);
      const statusIcon = category.failed === 0 ? '✅' : '❌';
      
      console.log(`${statusIcon} ${categoryName}: ${category.passed}/${category.total} (${passRate}%)`);
      
      if (category.failed > 0) {
        console.log(`   Failed tests:`);
        category.tests
          .filter(test => test.status !== 'passed')
          .forEach(test => {
            console.log(`   - ${test.name} (${test.file})`);
          });
      }
    }
  }
  
  console.log('=' .repeat(60));
  
  // Generate summary for CI
  const totalTests = Object.values(categories).reduce((sum, cat) => sum + cat.total, 0);
  const totalPassed = Object.values(categories).reduce((sum, cat) => sum + cat.passed, 0);
  const totalFailed = Object.values(categories).reduce((sum, cat) => sum + cat.failed, 0);
  const overallPassRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';
  
  console.log(`📈 Overall: ${totalPassed}/${totalTests} (${overallPassRate}%) tests passed`);
  
  // ETFO-specific summary
  const etfoCategory = categories['ETFO Planning'];
  if (etfoCategory.total > 0) {
    const etfoPassRate = ((etfoCategory.passed / etfoCategory.total) * 100).toFixed(1);
    console.log(`🎯 ETFO Planning: ${etfoCategory.passed}/${etfoCategory.total} (${etfoPassRate}%) tests passed`);
  }
  
  // Generate JSON report for CI consumption
  const categoryReport = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      passRate: parseFloat(overallPassRate),
    },
    categories: Object.fromEntries(
      Object.entries(categories)
        .filter(([_, cat]) => cat.total > 0)
        .map(([name, cat]) => [
          name,
          {
            total: cat.total,
            passed: cat.passed,
            failed: cat.failed,
            passRate: parseFloat(((cat.passed / cat.total) * 100).toFixed(1)),
          }
        ])
    ),
    etfoFocus: etfoCategory.total > 0 ? {
      total: etfoCategory.total,
      passed: etfoCategory.passed,
      failed: etfoCategory.failed,
      passRate: parseFloat(((etfoCategory.passed / etfoCategory.total) * 100).toFixed(1)),
    } : null,
  };
  
  // Write JSON report
  const fs = require('fs');
  const path = require('path');
  
  const reportsDir = path.join(process.cwd(), 'test-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(reportsDir, 'test-categories.json'),
    JSON.stringify(categoryReport, null, 2)
  );
  
  console.log(`📄 Detailed category report saved to: test-reports/test-categories.json`);
  
  return testResults;
};