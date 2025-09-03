"use strict";
/**
 * API-specific validation utilities for external data
 * Provides validation for common API response patterns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStandardApiResponse = isStandardApiResponse;
exports.isPaginatedResponse = isPaginatedResponse;
exports.isDatabaseResult = isDatabaseResult;
exports.isValidRequestBody = isValidRequestBody;
exports.createErrorResponse = createErrorResponse;
exports.safeJsonParse = safeJsonParse;
exports.getValidQueryParam = getValidQueryParam;
exports.getValidNumericParam = getValidNumericParam;
exports.getValidBooleanParam = getValidBooleanParam;
exports.isValidFileUpload = isValidFileUpload;
exports.isValidAuthData = isValidAuthData;
const typeGuards_1 = require("./typeGuards");
// Validate API response structure
function isStandardApiResponse(value) {
    if (!(0, typeGuards_1.isObject)(value)) {
        return false;
    }
    // Must have success field as boolean
    if (!(0, typeGuards_1.hasProperty)(value, 'success') || typeof value.success !== 'boolean') {
        return false;
    }
    // Optional fields validation with explicit checks
    if ((0, typeGuards_1.hasProperty)(value, 'error') && !(0, typeGuards_1.isString)(value.error)) {
        return false;
    }
    if ((0, typeGuards_1.hasProperty)(value, 'message') && !(0, typeGuards_1.isString)(value.message)) {
        return false;
    }
    return true;
}
function isPaginatedResponse(value) {
    if (!(0, typeGuards_1.isObject)(value)) {
        return false;
    }
    return ((0, typeGuards_1.hasProperty)(value, 'items') && Array.isArray(value.items) &&
        (0, typeGuards_1.hasProperty)(value, 'total') && (0, typeGuards_1.isValidNumber)(value.total));
}
// Database query result validation
function isDatabaseResult(value) {
    return value === null || (0, typeGuards_1.isObject)(value);
}
// Request body validation
function isValidRequestBody(value) {
    return (0, typeGuards_1.isObject)(value) && Object.keys(value).length > 0;
}
function createErrorResponse(error) {
    if ((0, typeGuards_1.isError)(error)) {
        return { error: error.message };
    }
    if ((0, typeGuards_1.isObject)(error) && (0, typeGuards_1.hasProperty)(error, 'message') && (0, typeGuards_1.isString)(error.message)) {
        return { error: error.message, details: error };
    }
    return { error: 'An unknown error occurred' };
}
// JSON parsing with validation
function safeJsonParse(jsonString, validator) {
    try {
        const parsed = JSON.parse(jsonString);
        if (validator && !validator(parsed)) {
            return { success: false, error: 'Parsed data does not match expected format' };
        }
        return { success: true, data: parsed };
    }
    catch (error) {
        return {
            success: false,
            error: (0, typeGuards_1.isError)(error) ? error.message : 'Failed to parse JSON'
        };
    }
}
// Query parameter validation
function getValidQueryParam(params, key, defaultValue) {
    const value = params[key];
    return ((0, typeGuards_1.isString)(value) && value.length > 0) ? value : defaultValue;
}
function getValidNumericParam(params, key, defaultValue) {
    const value = params[key];
    if ((0, typeGuards_1.isValidNumber)(value)) {
        return value;
    }
    if ((0, typeGuards_1.isString)(value)) {
        const parsed = parseInt(value, 10);
        return !isNaN(parsed) ? parsed : defaultValue;
    }
    return defaultValue;
}
function getValidBooleanParam(params, key, defaultValue) {
    const value = params[key];
    if (typeof value === 'boolean') {
        return value;
    }
    if (value === 'true' || value === '1') {
        return true;
    }
    if (value === 'false' || value === '0') {
        return false;
    }
    return defaultValue;
}
function isValidFileUpload(value) {
    return ((0, typeGuards_1.isObject)(value) &&
        (0, typeGuards_1.hasProperty)(value, 'filename') && (0, typeGuards_1.isString)(value.filename) &&
        (0, typeGuards_1.hasProperty)(value, 'mimetype') && (0, typeGuards_1.isString)(value.mimetype) &&
        (0, typeGuards_1.hasProperty)(value, 'size') && (0, typeGuards_1.isValidNumber)(value.size) &&
        (0, typeGuards_1.hasProperty)(value, 'buffer') && Buffer.isBuffer(value.buffer));
}
function isValidAuthData(value) {
    if (!(0, typeGuards_1.isObject)(value)) {
        return false;
    }
    return ((0, typeGuards_1.hasProperty)(value, 'email') &&
        (0, typeGuards_1.isString)(value.email) &&
        value.email.includes('@'));
}
//# sourceMappingURL=apiValidation.js.map