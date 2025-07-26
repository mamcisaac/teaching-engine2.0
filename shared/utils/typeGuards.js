"use strict";
/**
 * Type Guards for Runtime Validation
 *
 * These utilities provide safe type checking for values that may be 'any' type,
 * particularly useful for:
 * - JSON.parse results
 * - External API responses
 * - Error objects in catch blocks
 * - Dynamic imports
 * - Event handler parameters
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDefined = isDefined;
exports.isObject = isObject;
exports.isError = isError;
exports.isErrorLike = isErrorLike;
exports.hasErrorMessage = hasErrorMessage;
exports.isNonEmptyString = isNonEmptyString;
exports.isString = isString;
exports.isValidNumber = isValidNumber;
exports.isPositiveNumber = isPositiveNumber;
exports.isArray = isArray;
exports.isNonEmptyArray = isNonEmptyArray;
exports.isFunction = isFunction;
exports.isApiResponse = isApiResponse;
exports.tryParseJSON = tryParseJSON;
exports.hasProperty = hasProperty;
exports.hasProperties = hasProperties;
exports.hasId = hasId;
exports.safeBoolean = safeBoolean;
exports.isArrayOf = isArrayOf;
exports.isOptional = isOptional;
exports.validate = validate;
exports.validateAsync = validateAsync;
// Basic existence check
function isDefined(value) {
    return value !== null && value !== undefined;
}
// Check if value is a non-null object
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
// Error type guards
function isError(value) {
    return value instanceof Error;
}
function isErrorLike(value) {
    return isObject(value) && typeof value.message === 'string';
}
function hasErrorMessage(value) {
    return isObject(value) && 'message' in value && typeof value.message === 'string';
}
// String validation
function isNonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}
function isString(value) {
    return typeof value === 'string';
}
// Number validation
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
function isPositiveNumber(value) {
    return isValidNumber(value) && value > 0;
}
// Array validation
function isArray(value) {
    return Array.isArray(value);
}
function isNonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
}
// Function validation
function isFunction(value) {
    return typeof value === 'function';
}
function isApiResponse(value) {
    if (!isObject(value)) {
        return false;
    }
    // Check optional fields with explicit null/undefined handling
    if ('data' in value && value.data === null) {
        return false;
    }
    if ('error' in value && value.error !== undefined) {
        if (!isString(value.error) && !hasErrorMessage(value.error)) {
            return false;
        }
    }
    if ('status' in value && value.status !== undefined && !isValidNumber(value.status)) {
        return false;
    }
    return true;
}
// JSON parse result validation
function tryParseJSON(jsonString, validator) {
    try {
        const parsed = JSON.parse(jsonString);
        if (validator != null) {
            return validator(parsed) ? parsed : null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
// Safe property access
function hasProperty(obj, key) {
    return isObject(obj) && key in obj;
}
function hasProperties(obj, ...keys) {
    return isObject(obj) && keys.every(key => key in obj);
}
function hasId(value) {
    return isObject(value) &&
        'id' in value &&
        (isString(value.id) || isValidNumber(value.id));
}
// Safe conditional checks with explicit boolean conversions
function safeBoolean(value) {
    if (value === null || value === undefined) {
        return false;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return value !== 0 && !isNaN(value);
    }
    if (typeof value === 'string') {
        return value.length > 0;
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    if (typeof value === 'object') {
        return Object.keys(value).length > 0;
    }
    return false;
}
// Type guard composers
function isArrayOf(value, itemGuard) {
    return isArray(value) && value.every(itemGuard);
}
function isOptional(value, guard) {
    return value === undefined || guard(value);
}
function validate(value, validator, errorMessage = 'Validation failed') {
    if (validator(value)) {
        return { isValid: true, value };
    }
    return { isValid: false, error: errorMessage };
}
// Async validation helper
async function validateAsync(value, validator, transform, errorMessage = 'Async validation failed') {
    try {
        const isValid = await validator(value);
        if (isValid) {
            return { isValid: true, value: transform(value) };
        }
        return { isValid: false, error: errorMessage };
    }
    catch (error) {
        return {
            isValid: false,
            error: isErrorLike(error) ? error.message : errorMessage
        };
    }
}
