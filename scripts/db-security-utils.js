"use strict";
/**
 * Database Security Utilities
 *
 * This module provides secure utilities for handling database operations
 * to prevent SQL injection vulnerabilities.
 *
 * SECURITY CRITICAL: All database identifiers must be validated through these utilities
 * to prevent SQL injection attacks via identifier manipulation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReservedWord = isReservedWord;
exports.isValidIdentifier = isValidIdentifier;
exports.validateTableName = validateTableName;
exports.validateDatabaseName = validateDatabaseName;
exports.validateFieldName = validateFieldName;
exports.createSafeDeleteStatement = createSafeDeleteStatement;
exports.createSafeCreateDatabaseStatement = createSafeCreateDatabaseStatement;
exports.createSafeDropDatabaseStatement = createSafeDropDatabaseStatement;
exports.createSafeAlterSequenceStatement = createSafeAlterSequenceStatement;
exports.createSafeTableIdentifier = createSafeTableIdentifier;
exports.createSafeFieldIdentifier = createSafeFieldIdentifier;
/**
 * Comprehensive list of SQL reserved words that cannot be used as identifiers
 * Includes common SQL keywords from SQLite, PostgreSQL, MySQL, and SQL Server
 */
const SQL_RESERVED_WORDS = new Set([
    // SQLite reserved words
    'ABORT', 'ACTION', 'ADD', 'AFTER', 'ALL', 'ALTER', 'ANALYZE', 'AND', 'AS', 'ASC',
    'ATTACH', 'AUTOINCREMENT', 'BEFORE', 'BEGIN', 'BETWEEN', 'BY', 'CASCADE', 'CASE',
    'CAST', 'CHECK', 'COLLATE', 'COLUMN', 'COMMIT', 'CONFLICT', 'CONSTRAINT', 'CREATE',
    'CROSS', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'DATABASE', 'DEFAULT',
    'DEFERRABLE', 'DEFERRED', 'DELETE', 'DESC', 'DETACH', 'DISTINCT', 'DROP', 'EACH',
    'ELSE', 'END', 'ESCAPE', 'EXCEPT', 'EXCLUSIVE', 'EXISTS', 'EXPLAIN', 'FAIL', 'FOR',
    'FOREIGN', 'FROM', 'FULL', 'GLOB', 'GROUP', 'HAVING', 'IF', 'IGNORE', 'IMMEDIATE',
    'IN', 'INDEX', 'INDEXED', 'INITIALLY', 'INNER', 'INSERT', 'INSTEAD', 'INTERSECT',
    'INTO', 'IS', 'ISNULL', 'JOIN', 'KEY', 'LEFT', 'LIKE', 'LIMIT', 'MATCH', 'NATURAL',
    'NO', 'NOT', 'NOTNULL', 'NULL', 'OF', 'OFFSET', 'ON', 'OR', 'ORDER', 'OUTER',
    'PLAN', 'PRAGMA', 'PRIMARY', 'QUERY', 'RAISE', 'RECURSIVE', 'REFERENCES', 'REGEXP',
    'REINDEX', 'RELEASE', 'RENAME', 'REPLACE', 'RESTRICT', 'RIGHT', 'ROLLBACK', 'ROW',
    'SAVEPOINT', 'SELECT', 'SET', 'TABLE', 'TEMP', 'TEMPORARY', 'THEN', 'TO',
    'TRANSACTION', 'TRIGGER', 'UNION', 'UNIQUE', 'UPDATE', 'USING', 'VACUUM', 'VALUES',
    'VIEW', 'VIRTUAL', 'WHEN', 'WHERE', 'WITH', 'WITHOUT',
    // Additional PostgreSQL reserved words
    'ARRAY', 'BIGINT', 'BINARY', 'BIT', 'BOOLEAN', 'CHAR', 'CHARACTER', 'DATE',
    'DECIMAL', 'DOUBLE', 'FLOAT', 'INT', 'INTEGER', 'INTERVAL', 'NUMERIC', 'REAL',
    'SERIAL', 'SMALLINT', 'TEXT', 'TIME', 'TIMESTAMP', 'VARCHAR', 'ZONE',
    // Common MySQL reserved words
    'AUTO_INCREMENT', 'CHANGE', 'DELAYED', 'DISTINCTROW', 'DIV', 'DUAL', 'ENCLOSED',
    'ESCAPED', 'FIELDS', 'FORCE', 'FULLTEXT', 'HIGH_PRIORITY', 'IGNORE', 'KEYS',
    'KILL', 'LINEAR', 'LINES', 'LOAD', 'LOCK', 'LOW_PRIORITY', 'MOD', 'OPTIMIZE',
    'OPTIONALLY', 'OUTFILE', 'PROCEDURE', 'PURGE', 'RANGE', 'READ', 'RLIKE', 'SCHEMAS',
    'SHOW', 'SPATIAL', 'STRAIGHT_JOIN', 'TERMINATED', 'UNLOCK', 'UNSIGNED', 'USE',
    'WRITE', 'X509', 'XOR', 'ZEROFILL',
    // System and dangerous keywords
    'ADMIN', 'AFTER', 'AGGREGATE', 'ALWAYS', 'ASSERTION', 'ASSIGNMENT', 'AT', 'ATTRIBUTE',
    'AUTHORIZATION', 'BEFORE', 'BERNOULLI', 'BREADTH', 'CATALOG', 'CATALOG_NAME',
    'CHAIN', 'CHARACTERISTICS', 'CHARACTERS', 'CHARACTER_LENGTH', 'CHARACTER_SET_CATALOG',
    'CHARACTER_SET_NAME', 'CHARACTER_SET_SCHEMA', 'CLASS_ORIGIN', 'COALESCE', 'COLLATION',
    'COLLATION_CATALOG', 'COLLATION_NAME', 'COLLATION_SCHEMA', 'COLUMN_NAME', 'COMMAND_FUNCTION',
    'COMMAND_FUNCTION_CODE', 'COMMITTED', 'CONDITION_NUMBER', 'CONNECTION_NAME', 'CONSTRAINT_CATALOG',
    'CONSTRAINT_NAME', 'CONSTRAINT_SCHEMA', 'CONSTRUCTOR', 'CONTINUE', 'CURSOR_NAME',
    'DATA', 'DATETIME_INTERVAL_CODE', 'DATETIME_INTERVAL_PRECISION', 'DEFAULTS', 'DEFERRABLE',
    'DEFERRED', 'DEFINED', 'DEFINER', 'DEGREE', 'DEPTH', 'DERIVED', 'DESCRIPTOR',
    'DIAGNOSTICS', 'DISPATCH', 'DOMAIN', 'DYNAMIC_FUNCTION', 'DYNAMIC_FUNCTION_CODE',
    'ELEMENT', 'ENFORCED', 'EXCLUDE', 'EXCLUDING', 'EXPRESSION', 'FINAL', 'FIRST',
    'FLAG', 'FOLLOWING', 'FORTRAN', 'FOUND', 'FUNCTION', 'GENERAL', 'GO', 'GOTO',
    'GRANTED', 'HIERARCHY', 'HOLD', 'IMPLEMENTATION', 'INCLUDING', 'INCREMENT', 'INITIALLY',
    'INPUT', 'INSTANTIABLE', 'INVOKER', 'ISOLATION', 'JAVA', 'KEY_MEMBER', 'KEY_TYPE',
    'LAST', 'LENGTH', 'LEVEL', 'LOCATOR', 'MAP', 'MATCHED', 'MAXVALUE', 'MESSAGE_LENGTH',
    'MESSAGE_OCTET_LENGTH', 'MESSAGE_TEXT', 'METHOD', 'MINVALUE', 'MORE', 'MUMPS',
    'NAME', 'NAMES', 'NESTING', 'NEXT', 'NORMALIZE', 'NORMALIZED', 'NULLABLE',
    'NULLS', 'NUMBER', 'OBJECT', 'OCTETS', 'OPTION', 'OPTIONS', 'ORDERING', 'ORDINALITY',
    'OUTPUT', 'OVERRIDING', 'PAD', 'PARAMETER_MODE', 'PARAMETER_NAME', 'PARAMETER_ORDINAL_POSITION',
    'PARAMETER_SPECIFIC_CATALOG', 'PARAMETER_SPECIFIC_NAME', 'PARAMETER_SPECIFIC_SCHEMA',
    'PARTIAL', 'PASCAL', 'PATH', 'PLACING', 'PLI', 'PRECEDING', 'PRESERVE', 'PRIOR',
    'PRIVILEGES', 'PUBLIC', 'READ', 'RELATIVE', 'REPEATABLE', 'RESTART', 'RETURNED_CARDINALITY',
    'RETURNED_LENGTH', 'RETURNED_OCTET_LENGTH', 'RETURNED_SQLSTATE', 'RETURNS', 'ROLE',
    'ROUTINE', 'ROUTINE_CATALOG', 'ROUTINE_NAME', 'ROUTINE_SCHEMA', 'ROW_COUNT', 'SCALE',
    'SCHEMA', 'SCHEMA_NAME', 'SCOPE', 'SECTION', 'SECURITY', 'SELF', 'SEQUENCE', 'SERIALIZABLE',
    'SERVER_NAME', 'SESSION', 'SETS', 'SIMPLE', 'SIZE', 'SOURCE', 'SPACE', 'SPECIFIC_NAME',
    'STATE', 'STATEMENT', 'STRUCTURE', 'STYLE', 'SUBCLASS_ORIGIN', 'SYSTEM_USER', 'TABLE_NAME',
    'TIES', 'TOP_LEVEL_COUNT', 'TRANSACTIONS_COMMITTED', 'TRANSACTIONS_ROLLED_BACK',
    'TRANSACTION_ACTIVE', 'TRANSFORM', 'TRANSFORMS', 'TRANSLATE', 'TRANSLATION', 'TREAT',
    'TYPE', 'UNBOUNDED', 'UNCOMMITTED', 'UNDER', 'UNNAMED', 'USAGE', 'USER_DEFINED_TYPE_CATALOG',
    'USER_DEFINED_TYPE_CODE', 'USER_DEFINED_TYPE_NAME', 'USER_DEFINED_TYPE_SCHEMA', 'WORK',
    'WRITE', 'YEARS', 'ZONES'
]);
/**
 * Allowlist of safe table names that are known to be valid in this application
 * This provides an additional layer of security beyond pattern matching
 */
const ALLOWED_TABLE_NAMES = new Set([
    'User', 'LessonPlan', 'Template', 'Session', 'UserProfile', 'Course', 'Enrollment',
    'Assignment', 'Submission', 'Grade', 'Comment', 'Attachment', 'Notification',
    'ActivityLog', 'Setting', 'Permission', 'Role', 'UserRole', 'Category', 'Tag',
    'LessonPlanTag', 'SharedLessonPlan', 'Feedback', 'Progress', 'Achievement',
    'Resource', 'LessonPlanResource', 'Discussion', 'Message', 'Announcement',
    'Calendar', 'Event', 'Attendance', 'Quiz', 'Question', 'Answer', 'Response',
    'Rubric', 'Criterion', 'Assessment', 'Portfolio', 'Artifact', 'Reflection',
    'Goal', 'Objective', 'Standard', 'Competency', 'SkillAssessment', 'Report',
    'Analytics', 'Dashboard', 'Widget', 'Preference', 'Theme', 'Layout', 'View',
    'Export', 'Import', 'Backup', 'Archive', 'AuditLog', 'SecurityEvent',
    'ApiKey', 'Token', 'RefreshToken', 'PasswordReset', 'EmailVerification',
    'TwoFactorAuth', 'LoginAttempt', 'BlacklistedToken', 'WhitelistedDomain',
    'RateLimitEntry', 'IpRestriction', 'UserDevice', 'SessionToken'
]);
/**
 * Allowlist of safe database names for multi-tenant scenarios
 */
const ALLOWED_DATABASE_NAMES = new Set([
    'teaching_engine', 'teaching_engine_test', 'teaching_engine_dev',
    'teaching_engine_staging', 'teaching_engine_prod', 'test_db',
    'development', 'staging', 'production'
]);
/**
 * Checks if an identifier is a SQL reserved word
 * @param identifier - The identifier to check
 * @returns true if it's a reserved word, false otherwise
 */
function isReservedWord(identifier) {
    return SQL_RESERVED_WORDS.has(identifier.toUpperCase());
}
/**
 * Validates a database/table identifier to prevent SQL injection
 * Now includes reserved word checking and enhanced security validation
 * @param identifier - The table or database name to validate
 * @param maxLength - Maximum allowed length (default: 64)
 * @param requireAllowlist - Whether to require the identifier to be in allowlist (default: false)
 * @returns true if valid, false otherwise
 */
function isValidIdentifier(identifier, maxLength = 64, requireAllowlist = false) {
    if (!identifier || typeof identifier !== 'string') {
        return false;
    }
    // Check length
    if (identifier.length === 0 || identifier.length > maxLength) {
        return false;
    }
    // Check format: starts with letter or underscore, followed by alphanumeric or underscore
    const validPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!validPattern.test(identifier)) {
        return false;
    }
    // Check against SQL reserved words
    if (isReservedWord(identifier)) {
        return false;
    }
    // Check against allowlist if required
    if (requireAllowlist && !ALLOWED_TABLE_NAMES.has(identifier)) {
        return false;
    }
    // Additional security checks
    // Prevent common injection patterns
    const dangerousPatterns = [
        /--/, // SQL comments
        /\/\*/, // SQL block comments
        /;/, // Statement terminators
        /'/, // Single quotes
        /"/, // Double quotes (already handled by pattern but explicit check)
        /`/, // Backticks
        /\x00/, // Null bytes
        /\n/, // Newlines
        /\r/, // Carriage returns
        /\t/, // Tabs
    ];
    for (const pattern of dangerousPatterns) {
        if (pattern.test(identifier)) {
            return false;
        }
    }
    return true;
}
/**
 * Sanitizes and validates a table name for use in SQL operations
 * Uses strict allowlist checking for maximum security
 * @param tableName - The table name to validate
 * @param requireAllowlist - Whether to require allowlist validation (default: true for production safety)
 * @returns The validated table name
 * @throws Error if the table name is invalid
 */
function validateTableName(tableName, requireAllowlist = true) {
    if (!isValidIdentifier(tableName, 64, requireAllowlist)) {
        const reasons = [];
        if (!tableName || typeof tableName !== 'string') {
            reasons.push('must be a non-empty string');
        }
        else {
            if (tableName.length === 0 || tableName.length > 64) {
                reasons.push('must be between 1 and 64 characters');
            }
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
                reasons.push('must contain only alphanumeric characters and underscores, and start with a letter or underscore');
            }
            if (isReservedWord(tableName)) {
                reasons.push('cannot be a SQL reserved word');
            }
            if (requireAllowlist && !ALLOWED_TABLE_NAMES.has(tableName)) {
                reasons.push('must be in the approved table name allowlist');
            }
        }
        throw new Error(`Invalid table name: ${tableName}. Validation failed: ${reasons.join(', ')}.`);
    }
    return tableName;
}
/**
 * Sanitizes and validates a database name for use in SQL operations
 * Uses strict allowlist checking for maximum security
 * @param dbName - The database name to validate
 * @param requireAllowlist - Whether to require allowlist validation (default: true for production safety)
 * @returns The validated database name
 * @throws Error if the database name is invalid
 */
function validateDatabaseName(dbName, requireAllowlist = true) {
    if (!isValidIdentifier(dbName, 64, false)) { // Don't use table allowlist for DB names
        const reasons = [];
        if (!dbName || typeof dbName !== 'string') {
            reasons.push('must be a non-empty string');
        }
        else {
            if (dbName.length === 0 || dbName.length > 64) {
                reasons.push('must be between 1 and 64 characters');
            }
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dbName)) {
                reasons.push('must contain only alphanumeric characters and underscores, and start with a letter or underscore');
            }
            if (isReservedWord(dbName)) {
                reasons.push('cannot be a SQL reserved word');
            }
        }
        throw new Error(`Invalid database name: ${dbName}. Validation failed: ${reasons.join(', ')}.`);
    }
    // Additional check for database name allowlist
    if (requireAllowlist && !ALLOWED_DATABASE_NAMES.has(dbName)) {
        throw new Error(`Invalid database name: ${dbName}. Database name must be in the approved allowlist.`);
    }
    return dbName;
}
/**
 * Validates field/column names for safe use in SQL queries
 * @param fieldName - The field name to validate
 * @param allowedFields - Optional allowlist of permitted field names
 * @returns The validated field name
 * @throws Error if the field name is invalid
 */
function validateFieldName(fieldName, allowedFields) {
    if (!isValidIdentifier(fieldName, 64, false)) {
        throw new Error(`Invalid field name: ${fieldName}. Field names must be valid SQL identifiers.`);
    }
    if (allowedFields && !allowedFields.includes(fieldName)) {
        throw new Error(`Invalid field name: ${fieldName}. Field name must be in the approved allowlist: [${allowedFields.join(', ')}].`);
    }
    return fieldName;
}
/**
 * Creates a safe DELETE FROM statement using Prisma's raw method
 * This prevents SQL injection by validating the table name
 * @param tableName - The table name to delete from
 * @param requireAllowlist - Whether to require allowlist validation (default: true)
 * @returns A Prisma raw template literal for safe execution
 */
function createSafeDeleteStatement(tableName, requireAllowlist = true) {
    const validatedTableName = validateTableName(tableName, requireAllowlist);
    // Return a function that creates the Prisma raw query
    return (prisma) => prisma.$executeRaw `DELETE FROM ${prisma.Prisma.raw(`"${validatedTableName}"`)}`;
}
/**
 * Creates a safe CREATE DATABASE statement using Prisma's raw method
 * @param dbName - The database name to create
 * @param requireAllowlist - Whether to require allowlist validation (default: true)
 * @returns A Prisma raw template literal for safe execution
 */
function createSafeCreateDatabaseStatement(dbName, requireAllowlist = true) {
    const validatedDbName = validateDatabaseName(dbName, requireAllowlist);
    return (prisma) => prisma.$executeRaw `CREATE DATABASE ${prisma.Prisma.raw(`"${validatedDbName}"`)}`;
}
/**
 * Creates a safe DROP DATABASE statement using Prisma's raw method
 * @param dbName - The database name to drop
 * @param requireAllowlist - Whether to require allowlist validation (default: true)
 * @returns A Prisma raw template literal for safe execution
 */
function createSafeDropDatabaseStatement(dbName, requireAllowlist = true) {
    const validatedDbName = validateDatabaseName(dbName, requireAllowlist);
    return (prisma) => prisma.$executeRaw `DROP DATABASE IF EXISTS ${prisma.Prisma.raw(`"${validatedDbName}"`)}`;
}
/**
 * Creates a safe ALTER SEQUENCE statement using Prisma's raw method
 * @param tableName - The table name for the sequence
 * @param requireAllowlist - Whether to require allowlist validation (default: true)
 * @returns A Prisma raw template literal for safe execution
 */
function createSafeAlterSequenceStatement(tableName, requireAllowlist = true) {
    const validatedTableName = validateTableName(tableName, requireAllowlist);
    return (prisma) => prisma.$executeRaw `ALTER SEQUENCE IF EXISTS ${prisma.Prisma.raw(`"${validatedTableName}_id_seq"`)} RESTART WITH 1`;
}
/**
 * Creates a safe table identifier for use in raw SQL queries
 * @param tableName - The table name to make safe
 * @param requireAllowlist - Whether to require allowlist validation (default: true)
 * @returns A Prisma.raw() wrapped identifier
 */
function createSafeTableIdentifier(tableName, requireAllowlist = true) {
    const validatedTableName = validateTableName(tableName, requireAllowlist);
    return (prisma) => prisma.Prisma.raw(`"${validatedTableName}"`);
}
/**
 * Creates a safe field identifier for use in raw SQL queries
 * @param fieldName - The field name to make safe
 * @param allowedFields - Optional allowlist of permitted field names
 * @returns A Prisma.raw() wrapped identifier
 */
function createSafeFieldIdentifier(fieldName, allowedFields) {
    const validatedFieldName = validateFieldName(fieldName, allowedFields);
    return (prisma) => prisma.Prisma.raw(`"${validatedFieldName}"`);
}
//# sourceMappingURL=db-security-utils.js.map