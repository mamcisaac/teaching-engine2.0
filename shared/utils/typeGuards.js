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
exports.isAISuggestion = isAISuggestion;
exports.isReactEvent = isReactEvent;
exports.isInputEvent = isInputEvent;
exports.isSelectEvent = isSelectEvent;
exports.isCurriculumExpectation = isCurriculumExpectation;
exports.isLessonPlan = isLessonPlan;
exports.isUnitPlan = isUnitPlan;
exports.isSchoolInfo = isSchoolInfo;
exports.isValidDateString = isValidDateString;
exports.isDateLike = isDateLike;
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
        if (validator !== undefined) {
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
function isAISuggestion(value) {
    if (!isObject(value)) {
        return false;
    }
    const validTypes = ['goals', 'bigIdeas', 'activities', 'materials', 'assessments', 'reflections'];
    return (hasProperty(value, 'type') &&
        isString(value.type) &&
        validTypes.includes(value.type) &&
        hasProperty(value, 'suggestions') &&
        isArrayOf(value.suggestions, isString) &&
        (!hasProperty(value, 'rationale') || isOptional(value.rationale, isString)));
}
// Event handler type guards for React events
function isReactEvent(value) {
    return isObject(value) && hasProperty(value, 'target');
}
function isInputEvent(value) {
    return (isReactEvent(value) &&
        isObject(value.target) &&
        hasProperty(value.target, 'value') &&
        isString(value.target.value));
}
function isSelectEvent(value) {
    return (isReactEvent(value) &&
        isObject(value.target) &&
        hasProperty(value.target, 'value') &&
        isString(value.target.value));
}
function isCurriculumExpectation(value) {
    return (isObject(value) &&
        hasProperty(value, 'id') && isString(value.id) &&
        hasProperty(value, 'code') && isString(value.code) &&
        hasProperty(value, 'description') && isString(value.description) &&
        hasProperty(value, 'content') && isString(value.content));
}
function isLessonPlan(value) {
    return (isObject(value) &&
        hasProperty(value, 'title') && isString(value.title) &&
        hasProperty(value, 'date') && (isString(value.date) || value.date instanceof Date) &&
        hasProperty(value, 'duration') && isValidNumber(value.duration) &&
        (!hasProperty(value, 'expectations') || isOptional(value.expectations, (arr) => isArrayOf(arr, isString))));
}
function isUnitPlan(value) {
    return (isObject(value) &&
        hasProperty(value, 'title') && isString(value.title) &&
        hasProperty(value, 'subject') && isString(value.subject) &&
        hasProperty(value, 'grade') && isValidNumber(value.grade));
}
function isSchoolInfo(value) {
    return (isObject(value) &&
        (!hasProperty(value, 'name') || isOptional(value.name, isString)) &&
        (!hasProperty(value, 'board') || isOptional(value.board, isString)));
}
// Date/Time validation
function isValidDateString(value) {
    if (!isString(value))
        return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
}
function isDateLike(value) {
    return value instanceof Date || isValidDateString(value);
}
//# sourceMappingURL=typeGuards.js.map