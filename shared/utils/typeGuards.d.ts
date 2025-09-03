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
export declare function isDefined<T>(value: T | null | undefined): value is T;
export declare function isObject(value: unknown): value is Record<string, unknown>;
export declare function isError(value: unknown): value is Error;
export declare function isErrorLike(value: unknown): value is {
    message: string;
    [key: string]: unknown;
};
export declare function hasErrorMessage(value: unknown): value is {
    message: string;
};
export declare function isNonEmptyString(value: unknown): value is string;
export declare function isString(value: unknown): value is string;
export declare function isValidNumber(value: unknown): value is number;
export declare function isPositiveNumber(value: unknown): value is number;
export declare function isArray<T = unknown>(value: unknown): value is T[];
export declare function isNonEmptyArray<T = unknown>(value: unknown): value is T[];
export declare function isFunction(value: unknown): value is (...args: unknown[]) => unknown;
export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string | {
        message: string;
    };
    status?: number;
}
export declare function isApiResponse<T = unknown>(value: unknown): value is ApiResponse<T>;
export declare function tryParseJSON<T = unknown>(jsonString: string, validator?: (value: unknown) => value is T): T | null;
export declare function hasProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown>;
export declare function hasProperties<K extends string>(obj: unknown, ...keys: K[]): obj is Record<K, unknown>;
export interface IdObject {
    id: string | number;
}
export declare function hasId(value: unknown): value is IdObject;
export declare function safeBoolean(value: unknown): boolean;
export declare function isArrayOf<T>(value: unknown, itemGuard: (item: unknown) => item is T): value is T[];
export declare function isOptional<T>(value: unknown, guard: (value: unknown) => value is T): value is T | undefined;
export interface ValidationResult<T> {
    isValid: boolean;
    value?: T;
    error?: string;
}
export declare function validate<T>(value: unknown, validator: (value: unknown) => value is T, errorMessage?: string): ValidationResult<T>;
export declare function validateAsync<T>(value: unknown, validator: (value: unknown) => Promise<boolean>, transform: (value: unknown) => T, errorMessage?: string): Promise<ValidationResult<T>>;
export interface AISuggestion {
    type: 'goals' | 'bigIdeas' | 'activities' | 'materials' | 'assessments' | 'reflections';
    suggestions: string[];
    rationale?: string;
}
export declare function isAISuggestion(value: unknown): value is AISuggestion;
export declare function isReactEvent(value: unknown): value is {
    target: unknown;
};
export declare function isInputEvent(value: unknown): value is {
    target: {
        value: string;
    };
};
export declare function isSelectEvent(value: unknown): value is {
    target: {
        value: string;
        checked?: boolean;
    };
};
export interface CurriculumExpectation {
    id: string;
    code: string;
    description: string;
    content: string;
}
export declare function isCurriculumExpectation(value: unknown): value is CurriculumExpectation;
export interface LessonPlan {
    id?: string;
    title: string;
    date: string | Date;
    duration: number;
    expectations?: string[];
    [key: string]: unknown;
}
export declare function isLessonPlan(value: unknown): value is LessonPlan;
export interface UnitPlan {
    id?: string;
    title: string;
    subject: string;
    grade: number;
    [key: string]: unknown;
}
export declare function isUnitPlan(value: unknown): value is UnitPlan;
export interface SchoolInfo {
    name?: string;
    board?: string;
    [key: string]: unknown;
}
export declare function isSchoolInfo(value: unknown): value is SchoolInfo;
export declare function isValidDateString(value: unknown): value is string;
export declare function isDateLike(value: unknown): value is Date | string;
//# sourceMappingURL=typeGuards.d.ts.map