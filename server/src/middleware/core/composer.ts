import { Request, Response, NextFunction, RequestHandler } from 'express';
import logger from '../../logger';

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
export const compose = (...middlewares: Middleware[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let index = 0;

    const dispatch = async (err?: Error): Promise<void> => {
      if (err) {
        return next(err);
      }

      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];

      try {
        // Check if it's an error-handling middleware (4 parameters)
        if (middleware.length === 4) {
          // Skip error handlers in normal flow
          return dispatch();
        }

        // Regular middleware
        await (middleware as RequestHandler)(req, res, dispatch);
      } catch (_error) {
        next(error);
      }
    };

    await dispatch();
  };
};

// Conditional middleware - only apply if condition is met
export const conditional = (
  condition: boolean | ((req: Request) => boolean),
  middleware: Middleware
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const shouldApply = typeof condition === 'function' ? condition(req) : condition;
    
    if (shouldApply) {
      return (middleware as RequestHandler)(req, res, next);
    }
    
    next();
  };
};

// Create middleware that only runs once
export const once = (middleware: Middleware): RequestHandler => {
  let hasRun = false;
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!hasRun) {
      hasRun = true;
      return (middleware as RequestHandler)(req, res, next);
    }
    next();
  };
};

// Middleware with timeout
export const withTimeout = (
  middleware: Middleware,
  timeout: number = 5000
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let completed = false;

    const timeoutPromise = new Promise<void>((_, reject) => {
      timeoutId = setTimeout(() => {
        if (!completed) {
          reject(new Error(`Middleware timeout after ${timeout}ms`));
        }
      }, timeout);
    });

    const middlewarePromise = new Promise<void>((resolve, reject) => {
      (middleware as RequestHandler)(req, res, (err?: unknown) => {
        completed = true;
        if (timeoutId) clearTimeout(timeoutId);
        
        if (err) {
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
      next(error as unknown);
    }
  };
};

// Parallel middleware execution (for independent operations)
export const parallel = (...middlewares: Middleware[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const promises = middlewares.map(middleware => {
      return new Promise<void>((resolve, reject) => {
        (middleware as RequestHandler)(req, res, (err?: unknown) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    try {
      await Promise.all(promises);
      next();
    } catch (_error) {
      next(error as unknown);
    }
  };
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

// Middleware error wrapper
export const asyncMiddleware = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Log middleware execution time
export const timed = (name: string, middleware: Middleware): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    const handleNext = (err?: unknown) => {
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
      handleNext(error as unknown);
    }
  };
};