import multer from 'multer';
import ApiError from '../utils/ApiError.js';
export function notFoundHandler(req, res, next) { next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`)); }
export function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error.';
  let errors = error.errors;
  if (error instanceof multer.MulterError) {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = error.code === 'LIMIT_FILE_SIZE' ? `File exceeds the ${process.env.MAX_FILE_SIZE_MB || 10} MB upload limit.` : 'The uploaded file could not be processed.';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(error.keyPattern || {})[0] || 'Field'} is already in use.`;
  } else if (error.name === 'ValidationError') {
    statusCode = 400; message = 'Database validation failed.';
    errors = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
  } else if (error.name === 'CastError') { statusCode = 400; message = 'The supplied resource identifier is invalid.'; }
  else if (error.message?.startsWith('Unsupported file type') || error.message?.startsWith('The file extension')) { statusCode = 400; }
  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({ success: false, message, ...(errors ? { errors } : {}) });
}
