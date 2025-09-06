export class ValidationError extends Error {
  statusCode: number;
  
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export class NotFoundError extends Error {
  statusCode: number;
  
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;
  
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

export class ConflictError extends Error {
  statusCode: number;
  
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export function handleError(error: Error & { statusCode?: number }) {
  if (error.statusCode) {
    return {
      status: error.statusCode,
      message: error.message
    };
  }
  
  return {
    status: 500,
    message: 'Internal server error'
  };
}