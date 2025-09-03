/**
 * Common validation utilities for strict boolean expressions
 */
/**
 * Checks if a string is non-empty
 * @param value - The string to check
 * @returns true if the string is non-null, non-undefined, and non-empty
 */
export declare function isNonEmptyString(value: string | null | undefined): value is string;
/**
 * Checks if a number is valid (not null, undefined, 0, or NaN)
 * @param value - The number to check
 * @returns true if the number is valid
 */
export declare function isValidNumber(value: number | null | undefined): value is number;
/**
 * Checks if a number is defined (not null or undefined, but 0 is allowed)
 * @param value - The number to check
 * @returns true if the number is defined
 */
export declare function isDefinedNumber(value: number | null | undefined): value is number;
/**
 * Checks if a boolean is explicitly true or false (not null or undefined)
 * @param value - The boolean to check
 * @returns true if the boolean is explicitly true or false
 */
export declare function isDefinedBoolean(value: boolean | null | undefined): value is boolean;
/**
 * Safely converts a value to a string, returning empty string for null/undefined
 * @param value - The value to convert
 * @returns The string value or empty string
 */
export declare function toSafeString(value: string | null | undefined): string;
/**
 * Safely converts a value to a number, returning 0 for null/undefined
 * @param value - The value to convert
 * @returns The number value or 0
 */
export declare function toSafeNumber(value: number | null | undefined): number;
/**
 * Safely converts a value to a boolean, returning false for null/undefined
 * @param value - The value to convert
 * @returns The boolean value or false
 */
export declare function toSafeBoolean(value: boolean | null | undefined): boolean;
/**
 * Type guard for checking if a value is defined (not null or undefined)
 * @param value - The value to check
 * @returns true if the value is defined
 */
export declare function isDefined<T>(value: T | null | undefined): value is T;
/**
 * Type guard for checking if an object has a property
 * @param obj - The object to check
 * @param prop - The property name
 * @returns true if the object has the property
 */
export declare function hasProperty<T extends object, K extends PropertyKey>(obj: T, prop: K): obj is T & Record<K, unknown>;
/**
 * Safe array check - ensures value is a non-empty array
 * @param value - The value to check
 * @returns true if the value is a non-empty array
 */
export declare function isNonEmptyArray<T>(value: T[] | null | undefined): value is T[];
//# sourceMappingURL=validation.d.ts.map