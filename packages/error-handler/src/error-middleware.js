"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const AppError_1 = require("./AppError");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof AppError_1.AppError) {
        console.log(`Error ${req.method} ${req.url} - ${err.message}`);
        return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
            ...(err.details && { details: err.details }),
        });
    }
    console.log("Unhandled error:", err);
    return res.status(500).json({
        status: "error",
        message: "Something went wrong in routes! But we don't know what!",
    });
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=error-middleware.js.map