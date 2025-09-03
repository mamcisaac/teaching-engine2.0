"use strict";
/**
 * Common validation utilities for strict boolean expressions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNonEmptyString = isNonEmptyString;
exports.isValidNumber = isValidNumber;
exports.isDefinedNumber = isDefinedNumber;
exports.isDefinedBoolean = isDefinedBoolean;
exports.toSafeString = toSafeString;
exports.toSafeNumber = toSafeNumber;
exports.toSafeBoolean = toSafeBoolean;
exports.isDefined = isDefined;
exports.hasProperty = hasProperty;
exports.isNonEmptyArray = isNonEmptyArray;
/**
 * Checks if a string is non-empty
 * @param value - The string to check
 * @returns true if the string is non-null, non-undefined, and non-empty
 */
function isNonEmptyString(value) {
    return value !== null && value !== undefined && value !== '';
}
/**
 * Checks if a number is valid (not null, undefined, 0, or NaN)
 * @param value - The number to check
 * @returns true if the number is valid
 */
function isValidNumber(value) {
    return value !== null && value !== undefined && value !== 0 && !isNaN(value);
}
/**
 * Checks if a number is defined (not null or undefined, but 0 is allowed)
 * @param value - The number to check
 * @returns true if the number is defined
 */
function isDefinedNumber(value) {
    return value !== null && value !== undefined && !isNaN(value);
}
/**
 * Checks if a boolean is explicitly true or false (not null or undefined)
 * @param value - The boolean to check
 * @returns true if the boolean is explicitly true or false
 */
function isDefinedBoolean(value) {
    return value !== null && value !== undefined;
}
/**
 * Safely converts a value to a string, returning empty string for null/undefined
 * @param value - The value to convert
 * @returns The string value or empty string
 */
function toSafeString(value) {
    return value ?? '';
}
/**
 * Safely converts a value to a number, returning 0 for null/undefined
 * @param value - The value to convert
 * @returns The number value or 0
 */
function toSafeNumber(value) {
    return value ?? 0;
}
/**
 * Safely converts a value to a boolean, returning false for null/undefined
 * @param value - The value to convert
 * @returns The boolean value or false
 */
function toSafeBoolean(value) {
    return value ?? false;
}
/**
 * Type guard for checking if a value is defined (not null or undefined)
 * @param value - The value to check
 * @returns true if the value is defined
 */
function isDefined(value) {
    return value !== null && value !== undefined;
}
/**
 * Type guard for checking if an object has a property
 * @param obj - The object to check
 * @param prop - The property name
 * @returns true if the object has the property
 */
function hasProperty(obj, prop) {
    return prop in obj;
}
/**
 * Safe array check - ensures value is a non-empty array
 * @param value - The value to check
 * @returns true if the value is a non-empty array
 */
function isNonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
}
//# sourceMappingURL=validation.js.map