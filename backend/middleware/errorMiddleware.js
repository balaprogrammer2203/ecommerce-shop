const errorHandler = (err, _req, res, _next) => {
  const statusCode = err?.statusCode || err?.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Map common Mongoose/JS errors to consistent API errors.
  const normalized = (() => {
    if (err?.code === 11000) {
      return {
        code: 'DUPLICATE_KEY',
        message: 'Duplicate value violates a unique constraint',
        details: err?.keyValue,
      };
    }

    if (err?.name === 'ValidationError') {
      return {
        code: 'VALIDATION_ERROR',
        message: err.message || 'Validation failed',
        details: err?.errors,
      };
    }

    if (err?.name === 'CastError') {
      return {
        code: 'INVALID_ID',
        message: 'Invalid resource id',
        details: { path: err?.path, value: err?.value },
      };
    }

    return {
      code: err?.code || 'INTERNAL_ERROR',
      message: err?.message || 'Server Error',
      details: err?.details,
    };
  })();

  res.status(statusCode).json({
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
    },
    stack: isProduction ? undefined : err?.stack,
  });
};

module.exports = errorHandler;

