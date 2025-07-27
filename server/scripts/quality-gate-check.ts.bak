#!/usr/bin/env tsx
/**
 * Quality Gate Check
 * 
 * This script runs all quality gate checks
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface QualityGate {
  name: string;
  check: () => Promise<boolean>;
  required: boolean;
}

async function runQualityGateCheck(): Promise<void> {
  console.log('🚪 Running quality gate check...\n');

  const gates: QualityGate[] = [
    {
      name: 'Test Coverage (90%+ statements)',
      check: async () => {
        try {
          const coverageFile = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
          if (!fs.existsSync(coverageFile)) return false;
          
          const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
          return coverage.total.statements.pct >= 90;
        } catch {
          return false;
        }
      },
      required: true
    },
    {
      name: 'No TypeScript Errors',
      check: async () => {
        try {
          execSync('pnpm typecheck', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      },
      required: true
    },
    {
      name: 'No ESLint Errors',
      check: async () => {
        try {
          execSync('pnpm lint', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      },
      required: true
    },
    {
      name: 'All Tests Pass',
      check: async () => {
        try {
          execSync('pnpm test --passWithNoTests', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      },
      required: true
    },
    {
      name: 'No Security Vulnerabilities',
      check: async () => {
        try {
          execSync('pnpm audit --audit-level moderate', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      },
      required: false
    },
    {
      name: 'Build Succeeds',
      check: async () => {
        try {
          execSync('pnpm build', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      },
      required: true
    }
  ];

  const results: Array<{ gate: QualityGate; passed: boolean }> = [];

  // Run all gates
  for (const gate of gates) {
    process.stdout.write(`Checking: ${gate.name}... `);
    const passed = await gate.check();
    results.push({ gate, passed });
    
    console.log(passed ? '✅' : (gate.required ? '❌' : '⚠️'));
  }

  // Summary
  console.log('\n📊 Quality Gate Summary:\n');
  
  const requiredGates = results.filter(r => r.gate.required);
  const optionalGates = results.filter(r => !r.gate.required);
  
  const requiredPassed = requiredGates.filter(r => r.passed).length;
  const optionalPassed = optionalGates.filter(r => r.passed).length;
  
  console.log(`Required Gates: ${requiredPassed}/${requiredGates.length} passed`);
  console.log(`Optional Gates: ${optionalPassed}/${optionalGates.length} passed`);

  // Generate report
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    gates: results.map(r => ({
      name: r.gate.name,
      required: r.gate.required,
      passed: r.passed
    })),
    summary: {
      totalGates: gates.length,
      requiredGates: requiredGates.length,
      requiredPassed,
      optionalPassed,
      overallPassed: requiredPassed === requiredGates.length
    }
  };

  const reportFile = path.join(reportDir, `quality-gate-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  // Fail if any required gate didn't pass
  if (requiredPassed < requiredGates.length) {
    console.log('\n❌ Quality gate check failed! Not all required gates passed.');
    process.exit(1);
  } else {
    console.log('\n✅ All required quality gates passed!');
  }
}

// Run quality gate check
runQualityGateCheck().catch(error => {
  console.error('❌ Quality gate check error:', error);
  process.exit(1);
});