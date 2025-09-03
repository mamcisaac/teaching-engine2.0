/**
 * Database Security Utilities
 *
 * This module provides secure utilities for handling database operations
 * to prevent SQL injection vulnerabilities.
 *
 * SECURITY CRITICAL: All database identifiers must be validated through these utilities
 * to prevent SQL injection attacks via identifier manipulation.
 */
/**
 * Checks if an identifier is a SQL reserved word
 * @param identifier - The identifier to check
 * @returns true if it's a reserved word, false otherwise
 */
export declare function isReservedWord(identifier: string): boolean;
/**
 * Validates a database/table identifier to prevent SQL injection
 * Now includes reserved word checking and enhanced security validation
 * @param identifier - The table or database name to validate
 * @param maxLength - Maximum allowed length (default: 64)
 * @param requireAllowlist - Whether to require the identifier to be in allowlist (default: false)
 * @returns true if valid, false otherwise
 */
export declare function isValidIdentifier(identifier: string, maxLength?: number, requireAllowlist?: boolean): boolean;
/**
 * Sanitizes and validates a table name for use in SQL operations
 * Uses strict allowlist checking for maximum security
 * @param tableName - The table name to validate
 * @param requireAllowlist - Whether to require allowlist validation (default: true for production safety)
 * @returns The validated table name
 * @throws Error if the table name is invalid
 */
export declare function validateTableName(tableName: string, requireAllowlist?: boolean): string;
/**
 * Sanitizes and validates a database name for use in SQL operations
 * Uses strict allowlist checking for maximum security
 * @param dbName - The database name to validate
 * @param requireAllowlist - Whether to require allowlist validation (default: true for production safety)
 * @returns The validated database name
 * @throws Error if the database name is invalid
 */
export declare function validateDatabaseName(dbName: string, requireAllowlist?: boolean): string;
/**
 * Validates field/column names for safe use in SQL queries
 * @param fieldName - The field name to validate
 * @param allowedFields - Optional allowlist of permitted field names
 * @returns The validated field name
 * @throws Error if the field name is invalid
 */
export declare function validateFieldName(fieldName: string, allowedFields?: string[]): string;
/**
 * Creates a safe DELETE FROM statement using Prisma's raw method
 * This prevents SQL injection by validating the table name
 * @param tableName - The table name to delete from
 * @param requireAllowlist - Whether to require allowlist validation (default: true)
 * @returns A Prisma raw template literal for safe execution
 */
export declare function createSafeDeleteStatement(tableName: string, requireAllowlist?: boolean): (prisma: any) => any;
/**
 * Creates a safe CREATE DATABASE statement using Prisma's raw method
 * @param dbName - The database name to create
 * @param requireAllowlist - Whether to require allowlist validation (default: true)
 * @returns A Prisma raw template literal for safe execution
 */
export declare function createSafeCreateDatabaseStatement(dbName: string, requireAllowlist?: boolean): (prisma: any) => any;
/**
 * Creates a safe DROP DATABASE statement using Prisma's raw method
 * @param dbName - The database name to drop
 * @param requireAllowlist - Whether to require allowlist validation (default: true)
 * @returns A Prisma raw template literal for safe execution
 */
export declare function createSafeDropDatabaseStatement(dbName: string, requireAllowlist?: boolean): (prisma: any) => any;
/**
 * Creates a safe ALTER SEQUENCE statement using Prisma's raw method
 * @param tableName - The table name for the sequence
 * @param requireAllowlist - Whether to require allowlist validation (default: true)
 * @returns A Prisma raw template literal for safe execution
 */
export declare function createSafeAlterSequenceStatement(tableName: string, requireAllowlist?: boolean): (prisma: any) => any;
/**
 * Creates a safe table identifier for use in raw SQL queries
 * @param tableName - The table name to make safe
 * @param requireAllowlist - Whether to require allowlist validation (default: true)
 * @returns A Prisma.raw() wrapped identifier
 */
export declare function createSafeTableIdentifier(tableName: string, requireAllowlist?: boolean): (prisma: any) => any;
/**
 * Creates a safe field identifier for use in raw SQL queries
 * @param fieldName - The field name to make safe
 * @param allowedFields - Optional allowlist of permitted field names
 * @returns A Prisma.raw() wrapped identifier
 */
export declare function createSafeFieldIdentifier(fieldName: string, allowedFields?: string[]): (prisma: any) => any;
//# sourceMappingURL=db-security-utils.d.ts.map