import { MatcherResult } from '@vitest/expect';

declare module 'jest-axe' {
  export function axe(container: Element): Promise<{
    violations: Array<{
      id: string;
      impact: string;
      description: string;
      help: string;
      helpUrl: string;
      nodes: Array<{
        target: string[];
        html: string;
        failureSummary: string;
      }>;
    }>;
  }>;

  export function toHaveNoViolations(received: {
    violations: Array<any>;
  }): MatcherResult;
}

declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toHaveNoViolations(): T;
    }
    interface AsymmetricMatchersContaining {
      toHaveNoViolations(): any;
    }
  }
}