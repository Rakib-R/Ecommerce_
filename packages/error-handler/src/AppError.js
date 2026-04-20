"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.DatabaseError = exports.ForbiddenError = exports.AuthError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, isOperational = true, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this);
    }
}
exports.AppError = AppError;
// Not found error
class NotFoundError extends AppError {
    constructor(message = "Resources not found") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
// validation Error (use for Joi/zod/react-hook-form validation errors)
class ValidationError extends AppError {
    constructor(message = "Invalid request data", details) {
        super(message, 400, true, details);
    }
}
exports.ValidationError = ValidationError;
class AuthError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}
exports.AuthError = AuthError;
// Forbidden Error (For Insufficient Permissions)
class ForbiddenError extends AppError {
    constructor(message = "Forbidden access") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
// Database Error (For MongoDB/Postgres Errors)
class DatabaseError extends AppError {
    constructor(message = "Database error", details) {
        super(message, 500, true, details);
    }
}
exports.DatabaseError = DatabaseError;
// RATE LIMITING ERROR
class RateLimitError extends AppError {
    constructor(message = "Too many requests, Try again") {
        super(message, 429);
    }
}
exports.RateLimitError = RateLimitError;
//# sourceMappingURL=AppError.js.map