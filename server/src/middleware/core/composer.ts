/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import type { Request, Response, NextFunction, RequestHandler } from 'express';

import { logger } from '../../logger';

// Middleware type
export type Middleware = RequestHandler | ErrorRequestHandler;

// Error-handling middleware type
export type ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Compose multiple middleware into a single middleware
export const compose = (...middlewares: Middleware[]): RequestHandler => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let index = 0;

    const dispatch = async (err?: Error): Promise<void> => {
      if (err !== null && err !== undefined) {
        next(err); return;
      }

      if (index >= middlewares.length) {
        next(); return;
      }

      const middleware = middlewares[index++];

      try {
        // Check if it's an _error-handling middleware (4 parameters)
        if (middleware.length === 4) {
          // Skip _error handlers in normal flow
          return dispatch();
        }

        // Regular middleware
        await (middleware as RequestHandler)(req, res, (err?: unknown) => {
          if (err !== null && err !== undefined && typeof err === 'string') {
            void dispatch(new Error(err));
          } else {
            void dispatch(err as Error);
          }
        });
      } catch (_error) {
        next(_error);
      }
    };

    await dispatch();
  };

// Conditional middleware - only apply if condition is met
export const conditional = (
  condition: boolean | ((req: Request) => boolean),
  middleware: Middleware
): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
    const shouldApply = typeof condition === 'function' ? condition(req) : condition;
    
    if (shouldApply) {
      (middleware as RequestHandler)(req, res, next); return;
    }
    
    next();
  };

// Create middleware that only runs once
export const once = (middleware: Middleware): RequestHandler => {
  let hasRun = false;
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!hasRun) {
      hasRun = true;
      (middleware as RequestHandler)(req, res, next); return;
    }
    next();
  };
};

// Middleware with timeout
export const withTimeout = (
  middleware: Middleware,
  timeout = 5000
): RequestHandler => async (req: Request, res: Response, next: NextFunction) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let completed = false;

    const timeoutPromise = new Promise<void>((_resolve, reject) => {
      timeoutId = setTimeout(() => {
        if (!completed) {
          reject(new Error(`Middleware timeout after ${timeout}ms`));
        }
      }, timeout);
    });

    const middlewarePromise = new Promise<void>((resolve, reject) => {
      (middleware as RequestHandler)(req, res, (err?: unknown) => {
        completed = true;
        if (timeoutId !== null) {
clearTimeout(timeoutId);
}
        
        if (err !== null && err !== undefined) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    try {
      await Promise.race([middlewarePromise, timeoutPromise]);
      next();
    } catch (_error) {
      next(_error as unknown);
    }
  };

// Parallel middleware execution (for independent operations)
export const parallel = (...middlewares: Middleware[]): RequestHandler => async (req: Request, res: Response, next: NextFunction) => {
    const promises = middlewares.map(middleware => new Promise<void>((resolve, reject) => {
        (middleware as RequestHandler)(req, res, (err?: unknown) => {
          if (err !== null && err !== undefined) {
reject(err);
} else {
resolve();
}
        });
      }));

    try {
      await Promise.all(promises);
      next();
    } catch (_error) {
      next(_error as unknown);
    }
  };

// Middleware chain builder for fluent API
export class MiddlewareChain {
  private middlewares: Middleware[] = [];

  add(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  addIf(condition: boolean | ((req: Request) => boolean), middleware: Middleware): this {
    this.middlewares.push(conditional(condition, middleware));
    return this;
  }

  addParallel(...middlewares: Middleware[]): this {
    this.middlewares.push(parallel(...middlewares));
    return this;
  }

  addWithTimeout(middleware: Middleware, timeout: number): this {
    this.middlewares.push(withTimeout(middleware, timeout));
    return this;
  }

  build(): RequestHandler {
    return compose(...this.middlewares);
  }
}

// Create a new middleware chain
export const chain = (): MiddlewareChain => new MiddlewareChain();

// Middleware _error wrapper
export const asyncMiddleware = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line promise/no-callback-in-promise
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Log middleware execution time
export const timed = (name: string, middleware: Middleware): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    const handleNext = (err?: unknown): void => {
      const duration = Date.now() - start;
      
      logger.debug({
        middleware: name,
        duration,
        method: req.method,
        path: req.path,
      }, `Middleware executed: ${name}`);
      
      if (duration > 100) {
        logger.warn({
          middleware: name,
          duration,
        }, `Slow middleware detected: ${name}`);
      }
      
      next(err);
    };

    try {
      (middleware as RequestHandler)(req, res, handleNext);
    } catch (_error) {
      handleNext(_error as unknown);
    }
  };