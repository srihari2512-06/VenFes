export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(err, req, res, next) {
  if (err.message && err.message.includes('buffering timed out')) {
    return res.status(503).json({
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database connection timed out. Please check that MONGODB_URI is configured in Render environment variables and MongoDB Atlas Network Access has IP 0.0.0.0/0 allowed.'
      }
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {})
    }
  });
}
