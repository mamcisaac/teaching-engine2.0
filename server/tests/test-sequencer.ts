import Sequencer from '@jest/test-sequencer';
import { Test } from '@jest/test-result';
import crypto from 'crypto';

interface TestMetadata {
  path: string;
  duration?: number;
  failureRate?: number;
  dependencies?: string[];
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

export default class CustomTestSequencer extends Sequencer {
  // Test execution history (would normally be persisted)
  private static testHistory: Map<string, TestMetadata> = new Map();

  /**
   * Sort test files for optimal execution order
   */
  sort(tests: Array<Test>): Array<Test> {
    const testMetadata = this.getTestMetadata(tests);
    
    return [...tests].sort((a, b) => {
      const metaA = testMetadata.get(a.path) || {} as TestMetadata;
      const metaB = testMetadata.get(b.path) || {} as TestMetadata;
      
      // 1. Priority: Critical tests first
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityA = priorityOrder[metaA.priority || 'medium'];
      const priorityB = priorityOrder[metaB.priority || 'medium'];
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      // 2. Failure rate: Tests that fail more often run first (fail fast)
      const failureA = metaA.failureRate || 0;
      const failureB = metaB.failureRate || 0;
      if (failureA !== failureB) return failureB - failureA;
      
      // 3. Dependencies: Tests with no dependencies first
      const depsA = (metaA.dependencies || []).length;
      const depsB = (metaB.dependencies || []).length;
      if (depsA !== depsB) return depsA - depsB;
      
      // 4. Duration: Faster tests first (for quicker feedback)
      const durationA = metaA.duration || 1000;
      const durationB = metaB.duration || 1000;
      if (Math.abs(durationA - durationB) > 100) {
        return durationA - durationB;
      }
      
      // 5. Alphabetical (for consistency)
      return a.path.localeCompare(b.path);
    });
  }

  /**
   * Shard tests across multiple workers for parallel execution
   */
  shard(tests: Array<Test>, options: { shardIndex: number; shardCount: number }): Array<Test> {
    const { shardIndex, shardCount } = options;
    
    // Group related tests together
    const testGroups = this.groupRelatedTests(tests);
    
    // Distribute groups evenly across shards
    const shardedGroups: Test[][] = Array(shardCount).fill(null).map(() => []);
    const groupDurations = testGroups.map(group => 
      group.reduce((sum, test) => {
        const meta = CustomTestSequencer.testHistory.get(test.path);
        return sum + (meta?.duration || 1000);
      }, 0)
    );
    
    // Sort groups by total duration (descending)
    const sortedGroupIndices = Array.from({ length: testGroups.length }, (_, i) => i)
      .sort((a, b) => groupDurations[b] - groupDurations[a]);
    
    // Assign groups to shards using bin packing algorithm
    const shardLoads = new Array(shardCount).fill(0);
    sortedGroupIndices.forEach(groupIndex => {
      const minLoadShard = shardLoads.indexOf(Math.min(...shardLoads));
      shardedGroups[minLoadShard].push(...testGroups[groupIndex]);
      shardLoads[minLoadShard] += groupDurations[groupIndex];
    });
    
    return shardedGroups[shardIndex - 1] || [];
  }

  /**
   * Get test metadata with priorities and dependencies
   */
  private getTestMetadata(tests: Array<Test>): Map<string, TestMetadata> {
    const metadata = new Map<string, TestMetadata>();
    
    tests.forEach(test => {
      const existing = CustomTestSequencer.testHistory.get(test.path) || {};
      const testName = test.path;
      
      // Determine priority based on test path/name
      let priority: TestMetadata['priority'] = 'medium';
      if (testName.includes('auth') || testName.includes('security')) {
        priority = 'critical';
      } else if (testName.includes('api') || testName.includes('integration')) {
        priority = 'high';
      } else if (testName.includes('unit') || testName.includes('utils')) {
        priority = 'low';
      }
      
      // Determine dependencies
      const dependencies: string[] = [];
      if (testName.includes('integration') && !testName.includes('auth')) {
        dependencies.push('auth.test');
      }
      if (testName.includes('e2e')) {
        dependencies.push('api.test', 'auth.test');
      }
      
      metadata.set(test.path, {
        path: test.path,
        priority,
        dependencies,
        duration: existing.duration,
        failureRate: existing.failureRate,
      });
    });
    
    return metadata;
  }

  /**
   * Group related tests together for better cache utilization
   */
  private groupRelatedTests(tests: Array<Test>): Array<Array<Test>> {
    const groups = new Map<string, Array<Test>>();
    
    tests.forEach(test => {
      // Group by directory
      const groupKey = this.getGroupKey(test.path);
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(test);
    });
    
    // Convert to array and sort groups by size (larger groups first)
    return Array.from(groups.values())
      .sort((a, b) => b.length - a.length);
  }

  /**
   * Determine group key for a test
   */
  private getGroupKey(testPath: string): string {
    // Group by feature/module
    if (testPath.includes('/auth/') || testPath.includes('auth.test')) {
      return 'auth';
    }
    if (testPath.includes('/api/') || testPath.includes('api.test')) {
      return 'api';
    }
    if (testPath.includes('/services/')) {
      return 'services';
    }
    if (testPath.includes('/utils/')) {
      return 'utils';
    }
    if (testPath.includes('e2e')) {
      return 'e2e';
    }
    
    // Default: group by directory
    const dir = testPath.substring(0, testPath.lastIndexOf('/'));
    return crypto.createHash('md5').update(dir).digest('hex').substring(0, 8);
  }

  /**
   * Update test history with execution results
   * This would normally be called by the test reporter
   */
  static updateTestHistory(testPath: string, duration: number, failed: boolean): void {
    const existing = CustomTestSequencer.testHistory.get(testPath) || {
      path: testPath,
      duration: duration,
      failureRate: 0,
    };
    
    // Update duration with exponential moving average
    const alpha = 0.3; // Weight for new observation
    const newDuration = existing.duration 
      ? alpha * duration + (1 - alpha) * existing.duration
      : duration;
    
    // Update failure rate
    const attempts = (existing as any).attempts || 0;
    const failures = (existing as any).failures || 0;
    const newAttempts = attempts + 1;
    const newFailures = failures + (failed ? 1 : 0);
    const newFailureRate = newFailures / newAttempts;
    
    CustomTestSequencer.testHistory.set(testPath, {
      ...existing,
      duration: Math.round(newDuration),
      failureRate: newFailureRate,
      attempts: newAttempts,
      failures: newFailures,
    } as any);
  }
}