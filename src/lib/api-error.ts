/**
 * Centralized API error handling utilities
 * Provides consistent error responses and logging across all API routes
 */

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Common API error types
 */
export const ApiErrors = {
    BadRequest: (message = 'Bad request', code?: string) =>
        new ApiError(400, message, code),

    Unauthorized: (message = 'Unauthorized', code?: string) =>
        new ApiError(401, message, code),

    Forbidden: (message = 'Forbidden', code?: string) =>
        new ApiError(403, message, code),

    NotFound: (message = 'Resource not found', code?: string) =>
        new ApiError(404, message, code),

    Conflict: (message = 'Resource conflict', code?: string) =>
        new ApiError(409, message, code),

    TooManyRequests: (message = 'Too many requests', code?: string) =>
        new ApiError(429, message, code),

    InternalServer: (message = 'Internal server error', code?: string) =>
        new ApiError(500, message, code),
};

/**
 * Handle API errors consistently
 * Logs detailed errors server-side, returns safe messages to client
 */
export function handleApiError(error: unknown, context?: string) {
    // Log detailed error server-side
    const logPrefix = context ? `[${context}]` : '[API Error]';

    if (error instanceof ApiError) {
        console.error(logPrefix, {
            statusCode: error.statusCode,
            message: error.message,
            code: error.code,
            details: error.details,
        });

        return {
            error: error.message,
            ...(error.code ? { code: error.code } : {}),
            ...(process.env.NODE_ENV !== 'production' && error.details ? { details: error.details } : {}),
        };
    }

    if (error instanceof Error) {
        console.error(logPrefix, {
            name: error.name,
            message: error.message,
            stack: error.stack,
        });

        // Don't expose internal error details in production
        if (process.env.NODE_ENV === 'production') {
            return { error: 'An unexpected error occurred' };
        }

        return { error: error.message };
    }

    console.error(logPrefix, 'Unknown error:', error);
    return { error: 'An unexpected error occurred' };
}

/**
 * Validate required environment variables
 */
export function validateEnv(vars: string[]): void {
    const missing = vars.filter(v => !process.env[v]);

    if (missing.length > 0) {
        throw new ApiError(
            500,
            'Server configuration error',
            'MISSING_ENV_VARS',
            { missing }
        );
    }
}

/**
 * Type-safe response builder
 */
export function apiResponse<T>(data: T, status = 200) {
    return Response.json(data, { status });
}

export function apiErrorResponse(error: unknown, context?: string) {
    const errorData = handleApiError(error, context);
    const statusCode = error instanceof ApiError ? error.statusCode : 500;

    return Response.json(errorData, { status: statusCode });
}
