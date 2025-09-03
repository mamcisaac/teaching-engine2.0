/**
 * API-specific validation utilities for external data
 * Provides validation for common API response patterns
 */
export interface StandardApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export declare function isStandardApiResponse<T = unknown>(value: unknown): value is StandardApiResponse<T>;
export interface PaginatedResponse<T = unknown> {
    items: T[];
    total: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
}
export declare function isPaginatedResponse<T = unknown>(value: unknown): value is PaginatedResponse<T>;
export declare function isDatabaseResult(value: unknown): value is Record<string, unknown> | null;
export declare function isValidRequestBody(value: unknown): value is Record<string, unknown>;
export interface ErrorResponse {
    error: string;
    details?: unknown;
}
export declare function createErrorResponse(error: unknown): ErrorResponse;
export declare function safeJsonParse<T = unknown>(jsonString: string, validator?: (value: unknown) => value is T): {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};
export declare function getValidQueryParam(params: Record<string, unknown>, key: string, defaultValue: string): string;
export declare function getValidNumericParam(params: Record<string, unknown>, key: string, defaultValue: number): number;
export declare function getValidBooleanParam(params: Record<string, unknown>, key: string, defaultValue: boolean): boolean;
export interface FileUpload {
    filename: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export declare function isValidFileUpload(value: unknown): value is FileUpload;
export interface AuthData {
    email: string;
    password?: string;
    token?: string;
}
export declare function isValidAuthData(value: unknown): value is AuthData;
//# sourceMappingURL=apiValidation.d.ts.map