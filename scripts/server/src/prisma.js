"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClient = exports.prisma = exports.Prisma = void 0;
// Import from the database package
const database_1 = require("@teaching-engine/database");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return database_1.PrismaClient; } });
// Re-export everything from database package except PrismaClient and prisma
var database_2 = require("@teaching-engine/database");
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return database_2.Prisma; } });
// Create singleton instance for server usage
const globalForPrisma = globalThis;
// In test environment, use the test client if available
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
// Create a getter that always returns the current test client
const getPrisma = () => {
    if (isTestEnvironment && globalForPrisma.testPrismaClient !== undefined) {
        return globalForPrisma.testPrismaClient;
    }
    // For unit tests without proper database setup, throw a helpful error
    if (isTestEnvironment && !globalForPrisma.testPrismaClient) {
        throw new Error('Database client not initialized for tests. ' +
            'Unit tests should mock the database. ' +
            'Integration tests should use proper test setup with database initialization.');
    }
    return (globalForPrisma.prisma ??
        new database_1.PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        }));
};
// Create a proxy to always use the current client
exports.prisma = new Proxy({}, {
    get(_target, prop) {
        const client = getPrisma();
        return client[prop];
    },
    has(_target, prop) {
        const client = getPrisma();
        return prop in client;
    },
});
if (process.env.NODE_ENV !== 'production' && !isTestEnvironment) {
    globalForPrisma.prisma = getPrisma();
}
