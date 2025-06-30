/**
 * Load Test Runner
 * Executes load testing scenarios with configurable virtual users and scenarios
 */

import { performance } from 'perf_hooks';

interface LoadTestConfig {
  name: string;
  description: string;
  duration: string;
  virtualUsers: number;
  rampUpTime: string;
  scenarios: Array<{
    endpoint: string;
    weight: number;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  }>;
}

interface LoadTestResult {
  totalRequests: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  responseTimes: number[];
  errors: Array<{ timestamp: number; error: string; endpoint: string }>;
}

interface RequestResult {
  responseTime: number;
  success: boolean;
  error?: string;
  endpoint: string;
  timestamp: number;
}

export class LoadTestRunner {
  private baseUrl: string = 'http://localhost:3000';
  private authToken: string = '';

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    this.authToken = token;
  }

  async executeScenario(config: LoadTestConfig): Promise<LoadTestResult> {
    console.log(`🎯 Running load test: ${config.name}`);
    console.log(`📊 ${config.virtualUsers} virtual users for ${config.duration}`);

    const durationMs = this.parseDuration(config.duration);
    const rampUpMs = this.parseDuration(config.rampUpTime);
    const usersPerSecond = config.virtualUsers / (rampUpMs / 1000);

    const startTime = Date.now();
    const endTime = startTime + durationMs;

    const results: RequestResult[] = [];
    const userPromises: Promise<void>[] = [];

    // Ramp up users gradually
    for (let i = 0; i < config.virtualUsers; i++) {
      const userDelay = (i / usersPerSecond) * 1000;

      const userPromise = this.delay(userDelay).then(async () => {
        await this.runVirtualUser(config, endTime, results);
      });

      userPromises.push(userPromise);
    }

    // Wait for all users to complete
    await Promise.all(userPromises);

    // Calculate metrics
    return this.calculateMetrics(results, durationMs);
  }

  private async runVirtualUser(
    config: LoadTestConfig,
    endTime: number,
    results: RequestResult[],
  ): Promise<void> {
    while (Date.now() < endTime) {
      // Select a random scenario based on weights
      const scenario = this.selectScenario(config.scenarios);

      try {
        const result = await this.makeRequest(scenario);
        results.push(result);
      } catch (error) {
        results.push({
          responseTime: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: scenario.endpoint,
          timestamp: Date.now(),
        });
      }

      // Add some random delay between requests (0.5-2 seconds)
      const delay = Math.random() * 1500 + 500;
      await this.delay(delay);
    }
  }

  private selectScenario(scenarios: LoadTestConfig['scenarios']): LoadTestConfig['scenarios'][0] {
    const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const scenario of scenarios) {
      currentWeight += scenario.weight;
      if (random <= currentWeight) {
        return scenario;
      }
    }

    return scenarios[0]; // Fallback
  }

  private async makeRequest(scenario: LoadTestConfig['scenarios'][0]): Promise<RequestResult> {
    const startTime = performance.now();
    const timestamp = Date.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...scenario.headers,
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const requestOptions: RequestInit = {
        method: scenario.method || 'GET',
        headers,
      };

      if (scenario.body && (scenario.method === 'POST' || scenario.method === 'PUT')) {
        requestOptions.body = JSON.stringify(scenario.body);
      }

      const response = await fetch(`${this.baseUrl}${scenario.endpoint}`, requestOptions);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      return {
        responseTime,
        success: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
        endpoint: scenario.endpoint,
        timestamp,
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      return {
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        endpoint: scenario.endpoint,
        timestamp,
      };
    }
  }

  private calculateMetrics(results: RequestResult[], durationMs: number): LoadTestResult {
    const totalRequests = results.length;
    const successfulRequests = results.filter((r) => r.success);
    const errors = results.filter((r) => !r.success);

    const responseTimes = successfulRequests.map((r) => r.responseTime);
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
        : 0;

    // Calculate percentiles
    const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.ceil(sortedResponseTimes.length * 0.95) - 1;
    const p99Index = Math.ceil(sortedResponseTimes.length * 0.99) - 1;

    const p95ResponseTime = sortedResponseTimes[p95Index] || 0;
    const p99ResponseTime = sortedResponseTimes[p99Index] || 0;

    const requestsPerSecond = (totalRequests / durationMs) * 1000;
    const errorRate = (errors.length / totalRequests) * 100;

    return {
      totalRequests,
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      p95ResponseTime: Math.round(p95ResponseTime * 100) / 100,
      p99ResponseTime: Math.round(p99ResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      responseTimes: responseTimes,
      errors: errors.map((e) => ({
        timestamp: e.timestamp,
        error: e.error || 'Unknown error',
        endpoint: e.endpoint,
      })),
    };
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)([ms])/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    return unit === 'm' ? value * 60 * 1000 : value * 1000;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Stress testing utilities
  async runStressTest(options: {
    endpoint: string;
    method?: string;
    maxUsers: number;
    stepUsers: number;
    stepDuration: number; // seconds
    body?: any;
  }): Promise<LoadTestResult[]> {
    const results: LoadTestResult[] = [];

    for (let users = options.stepUsers; users <= options.maxUsers; users += options.stepUsers) {
      console.log(`🔥 Stress testing with ${users} users`);

      const stressConfig: LoadTestConfig = {
        name: `stress-test-${users}-users`,
        description: `Stress test with ${users} concurrent users`,
        duration: `${options.stepDuration}s`,
        virtualUsers: users,
        rampUpTime: '10s',
        scenarios: [
          {
            endpoint: options.endpoint,
            weight: 100,
            method: options.method || 'GET',
            body: options.body,
          },
        ],
      };

      const result = await this.executeScenario(stressConfig);
      results.push(result);

      // Brief pause between stress levels
      await this.delay(5000);
    }

    return results;
  }

  // Spike testing utilities
  async runSpikeTest(options: {
    endpoint: string;
    baseUsers: number;
    spikeUsers: number;
    spikeDuration: number; // seconds
    method?: string;
    body?: any;
  }): Promise<{ base: LoadTestResult; spike: LoadTestResult; recovery: LoadTestResult }> {
    console.log(
      `⚡ Spike test: ${options.baseUsers} → ${options.spikeUsers} → ${options.baseUsers} users`,
    );

    // Base load
    const baseConfig: LoadTestConfig = {
      name: 'spike-test-base',
      description: 'Base load before spike',
      duration: '30s',
      virtualUsers: options.baseUsers,
      rampUpTime: '5s',
      scenarios: [
        {
          endpoint: options.endpoint,
          weight: 100,
          method: options.method || 'GET',
          body: options.body,
        },
      ],
    };

    const baseResult = await this.executeScenario(baseConfig);

    // Spike load
    const spikeConfig: LoadTestConfig = {
      ...baseConfig,
      name: 'spike-test-spike',
      description: 'Spike load',
      duration: `${options.spikeDuration}s`,
      virtualUsers: options.spikeUsers,
      rampUpTime: '1s', // Rapid ramp-up for spike
    };

    const spikeResult = await this.executeScenario(spikeConfig);

    // Recovery load
    const recoveryConfig: LoadTestConfig = {
      ...baseConfig,
      name: 'spike-test-recovery',
      description: 'Recovery after spike',
      duration: '30s',
    };

    const recoveryResult = await this.executeScenario(recoveryConfig);

    return {
      base: baseResult,
      spike: spikeResult,
      recovery: recoveryResult,
    };
  }
}
