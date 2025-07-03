// TypeScript declarations for custom Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(array: any[]): R;
    }
  }
}

export {};
