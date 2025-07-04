// Core exports
export * from './core';

// Domain exports
export * from './domains/auth';
export * from './domains/calendar';
export * from './domains/curriculum';
export * from './domains/newsletter';
export * from './domains/notes';
export * from './domains/notification';
export * from './domains/parent';
export * from './domains/planning';
export * from './domains/student';
export * from './domains/teacher';
// Additional domains - now migrated
export * from './domains/routine';
export * from './domains/resource';
export * from './domains/substitute';
export * from './domains/cognate';

// Legacy compatibility - to be removed after full migration
export { api } from './legacy/api';