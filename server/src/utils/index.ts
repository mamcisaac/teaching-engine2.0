// Export all utilities from a central location

export * from './errors';
export * from './responses';
export * from './dates';
export * from './validation';
export * from './performance';
export * from './database';
export * from './arrays';

// Re-export commonly used utilities
export {
  // Error handling
  AppError,
  ValidationError,
  NotFoundError,
  asyncHandler,
  handleErrorResponse,
  assertExists,
  assertAuthorized,
} from './errors';

export {
  // Response helpers
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
  successResponse,
  paginatedResponse,
} from './responses';

export {
  // Date utilities
  getDateRanges,
  formatDate,
  formatRelativeTime,
  isValidDate,
  parseFlexibleDate,
  getAcademicYear,
} from './dates';

export {
  // Validation
  commonSchemas,
  querySchemas,
  validateId,
  validatePagination,
  validateDateRange,
  createValidationMiddleware,
} from './validation';

export {
  // Performance
  PerformanceTimer,
  measurePerformance,
  measureDatabaseQuery,
  measureBatchOperation,
  retryWithBackoff,
  SimpleCache,
} from './performance';

export {
  // Database
  dbUtils,
  commonIncludes,
  withTransaction,
  batchCreate,
  batchUpdate,
  findOrCreate,
} from './database';

export {
  // Arrays and transformations
  arrayUtils,
  objectUtils,
  stringUtils,
  numberUtils,
  transformUtils,
} from './arrays';