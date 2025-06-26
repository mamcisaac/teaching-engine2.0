/**
 * AI Snapshot Base Test Framework
 * 
 * Provides the foundation for AI snapshot testing with consistent
 * setup, teardown, and snapshot management.
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AITestScenario, AI_TESTING_CONFIG } from '../utils/ai-testing/aiTestUtils';
import { AISnapshotNormalizer, NormalizedSnapshot } from '../utils/ai-testing/aiSnapshotNormalizer';
import { AITestDataGenerator } from '../utils/ai-testing/aiTestData';

// Get current file directory for Jest tests (use relative path)
const currentDirname = __dirname;

/**
 * Base class for AI snapshot testing
 */
export abstract class AISnapshotTestBase {
  protected static readonly SNAPSHOTS_DIR = path.join(currentDirname, 'snapshots');
  protected static testScenarios: AITestScenario[] = [];
  
  /**
   * Setup test environment for AI snapshot testing
   */
  static async setupTestEnvironment(): Promise<void> {
    // Ensure snapshots directory exists
    await this.ensureSnapshotsDirectory();
    
    // Load test scenarios
    this.testScenarios = AITestDataGenerator.generateTestScenarios();
    
    // Set environment for consistent testing
    process.env.AI_TESTING_MODE = 'snapshot';
    process.env.NODE_ENV = 'test';
    
    console.log(`✓ AI Snapshot testing environment initialized with ${this.testScenarios.length} scenarios`);
  }
  
  /**
   * Cleanup after tests
   */
  static async cleanupTestEnvironment(): Promise<void> {
    // Restore environment
    delete process.env.AI_TESTING_MODE;
    
    console.log('✓ AI Snapshot testing environment cleaned up');
  }
  
  /**
   * Ensure snapshots directory structure exists
   */
  private static async ensureSnapshotsDirectory(): Promise<void> {
    const subdirs = [
      'long-range-plans',
      'unit-plans', 
      'lesson-plans',
      'daybook',
      'validation-reports',
    ];
    
    try {
      await fs.access(this.SNAPSHOTS_DIR);
    } catch {
      await fs.mkdir(this.SNAPSHOTS_DIR, { recursive: true });
    }
    
    for (const subdir of subdirs) {
      const dirPath = path.join(this.SNAPSHOTS_DIR, subdir);
      try {
        await fs.access(dirPath);
      } catch {
        await fs.mkdir(dirPath, { recursive: true });
      }
    }
  }
  
  /**
   * Load existing snapshot or create new one
   */
  protected static async loadOrCreateSnapshot(
    testType: string,
    scenario: AITestScenario,
    normalizedResponse: NormalizedSnapshot
  ): Promise<{ isNew: boolean; snapshot: NormalizedSnapshot; hasChanges: boolean }> {
    const snapshotPath = this.getSnapshotPath(testType, scenario);
    
    try {
      const existingContent = await fs.readFile(snapshotPath, 'utf-8');
      const existingSnapshot: NormalizedSnapshot = JSON.parse(existingContent);
      
      // Compare snapshots for changes
      const hasChanges = !this.snapshotsEqual(existingSnapshot, normalizedResponse);
      
      if (hasChanges && AI_TESTING_CONFIG.enableSnapshots) {
        // Update snapshot if changes detected
        await this.saveSnapshot(snapshotPath, normalizedResponse);
        console.log(`📸 Updated snapshot: ${path.basename(snapshotPath)}`);
      }
      
      return {
        isNew: false,
        snapshot: existingSnapshot,
        hasChanges,
      };
    } catch (error) {
      // Snapshot doesn't exist, create new one
      if (AI_TESTING_CONFIG.enableSnapshots) {
        await this.saveSnapshot(snapshotPath, normalizedResponse);
        console.log(`📸 Created new snapshot: ${path.basename(snapshotPath)}`);
      }
      
      return {
        isNew: true,
        snapshot: normalizedResponse,
        hasChanges: false,
      };
    }
  }
  
  /**
   * Save snapshot to file
   */
  private static async saveSnapshot(snapshotPath: string, snapshot: NormalizedSnapshot): Promise<void> {
    const snapshotData = JSON.stringify(snapshot, null, 2);
    await fs.writeFile(snapshotPath, snapshotData, 'utf-8');
  }
  
  /**
   * Get snapshot file path for test type and scenario
   */
  private static getSnapshotPath(testType: string, scenario: AITestScenario): string {
    const filename = `${scenario.id}.snapshot.json`;
    return path.join(this.SNAPSHOTS_DIR, testType, filename);
  }
  
  /**
   * Compare two snapshots for equality
   */
  private static snapshotsEqual(snapshot1: NormalizedSnapshot, snapshot2: NormalizedSnapshot): boolean {
    // Deep comparison of normalized responses
    return JSON.stringify(snapshot1.response) === JSON.stringify(snapshot2.response) &&
           JSON.stringify(snapshot1.input) === JSON.stringify(snapshot2.input);
  }
  
  /**
   * Run snapshot test for a specific scenario and endpoint
   */
  static async runSnapshotTest(
    testType: string,
    scenario: AITestScenario,
    aiFunction: (input: any) => Promise<any>,
    inputGenerator: (scenario: AITestScenario) => any,
    normalizer: (response: any, scenario: AITestScenario, input: any) => NormalizedSnapshot
  ): Promise<void> {
    try {
      // Generate test input
      const input = inputGenerator(scenario);
      
      // Call AI function (could be real AI or mock)
      const response = await aiFunction(input);
      
      // Normalize response for snapshot comparison
      const normalizedSnapshot = normalizer(response, scenario, input);
      
      // Load or create snapshot
      const { isNew, snapshot, hasChanges } = await this.loadOrCreateSnapshot(
        testType,
        scenario,
        normalizedSnapshot
      );
      
      // Assert snapshot matches (unless it's new)
      if (!isNew) {
        expect(normalizedSnapshot.response).toEqual(snapshot.response);
        
        // Additional quality checks
        this.assertQualityStandards(normalizedSnapshot);
        
        if (hasChanges) {
          console.warn(`⚠️  Changes detected in ${testType} for scenario ${scenario.id}`);
        }
      }
      
      // Record test result
      await this.recordTestResult(testType, scenario, {
        success: true,
        isNew,
        hasChanges,
        validationScore: normalizedSnapshot.validation.contentScore,
      });
      
    } catch (error) {
      // Record test failure
      await this.recordTestResult(testType, scenario, {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }
  
  /**
   * Assert quality standards for AI responses
   */
  private static assertQualityStandards(snapshot: NormalizedSnapshot): void {
    const validation = snapshot.validation;
    
    // Ensure minimum quality standards
    expect(validation.isValid).toBe(true);
    expect(validation.contentScore).toBeGreaterThanOrEqual(70);
    expect(validation.structureScore).toBeGreaterThanOrEqual(80);
    
    // Check for critical issues
    if (validation.issues.length > 0) {
      console.warn(`Quality issues detected: ${validation.issues.join(', ')}`);
    }
    
    // Log warnings but don't fail
    if (validation.warnings.length > 0) {
      console.log(`Quality warnings: ${validation.warnings.join(', ')}`);
    }
  }
  
  /**
   * Record test result for reporting
   */
  private static async recordTestResult(
    testType: string,
    scenario: AITestScenario,
    result: {
      success: boolean;
      isNew?: boolean;
      hasChanges?: boolean;
      validationScore?: number;
      error?: string;
    }
  ): Promise<void> {
    const reportPath = path.join(this.SNAPSHOTS_DIR, 'validation-reports', `${testType}-results.json`);
    
    let results: any[] = [];
    try {
      const existingContent = await fs.readFile(reportPath, 'utf-8');
      results = JSON.parse(existingContent);
    } catch {
      // File doesn't exist yet
    }
    
    // Add or update result for this scenario
    const existingIndex = results.findIndex(r => r.scenarioId === scenario.id);
    const testResult = {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      testType,
      timestamp: new Date().toISOString(),
      ...result,
    };
    
    if (existingIndex >= 0) {
      results[existingIndex] = testResult;
    } else {
      results.push(testResult);
    }
    
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf-8');
  }
  
  /**
   * Generate summary report for all AI snapshot tests
   */
  static async generateSummaryReport(): Promise<void> {
    const reportTypes = ['long-range-plans', 'unit-plans', 'lesson-plans', 'daybook'];
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      successfulTests: 0,
      newSnapshots: 0,
      changedSnapshots: 0,
      qualityStats: {
        averageContentScore: 0,
        averageStructureScore: 0,
      },
      details: [] as any[],
    };
    
    for (const reportType of reportTypes) {
      const reportPath = path.join(this.SNAPSHOTS_DIR, 'validation-reports', `${reportType}-results.json`);
      
      try {
        const content = await fs.readFile(reportPath, 'utf-8');
        const results = JSON.parse(content);
        
        summary.totalTests += results.length;
        summary.successfulTests += results.filter((r: any) => r.success).length;
        summary.newSnapshots += results.filter((r: any) => r.isNew).length;
        summary.changedSnapshots += results.filter((r: any) => r.hasChanges).length;
        
        // Calculate quality averages
        const validResults = results.filter((r: any) => r.validationScore !== undefined);
        if (validResults.length > 0) {
          const avgScore = validResults.reduce((sum: number, r: any) => sum + r.validationScore, 0) / validResults.length;
          summary.qualityStats.averageContentScore += avgScore;
        }
        
        summary.details.push({
          testType: reportType,
          results: results.length,
          successful: results.filter((r: any) => r.success).length,
          failed: results.filter((r: any) => !r.success).length,
        });
        
      } catch (error) {
        console.warn(`Could not read report for ${reportType}: ${error}`);
      }
    }
    
    // Finalize averages
    if (reportTypes.length > 0) {
      summary.qualityStats.averageContentScore /= reportTypes.length;
      summary.qualityStats.averageStructureScore = summary.qualityStats.averageContentScore; // Simplified
    }
    
    // Save summary report
    const summaryPath = path.join(this.SNAPSHOTS_DIR, 'ai-snapshot-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
    
    console.log('📊 AI Snapshot Test Summary:');
    console.log(`   Total Tests: ${summary.totalTests}`);
    console.log(`   Successful: ${summary.successfulTests}`);
    console.log(`   New Snapshots: ${summary.newSnapshots}`);
    console.log(`   Changed Snapshots: ${summary.changedSnapshots}`);
    console.log(`   Average Quality Score: ${summary.qualityStats.averageContentScore.toFixed(1)}`);
  }
  
  /**
   * Get scenarios for a specific test filter
   */
  static getTestScenarios(filter?: {
    grade?: number;
    subject?: string;
    complexity?: 'basic' | 'intermediate' | 'advanced';
  }): AITestScenario[] {
    // Ensure scenarios are loaded before filtering
    if (this.testScenarios.length === 0) {
      this.testScenarios = AITestDataGenerator.generateTestScenarios();
    }
    
    if (!filter) return this.testScenarios;
    
    return this.testScenarios.filter(scenario => {
      return (!filter.grade || scenario.grade === filter.grade) &&
             (!filter.subject || scenario.subject === filter.subject) &&
             (!filter.complexity || scenario.complexity === filter.complexity);
    });
  }
}