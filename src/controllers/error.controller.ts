import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  statusCode?: number;
  status?: string;
  code?: string; // For DB error codes like '23505'
}

const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let status = 'error';
  let message = error.message || 'Something went wrong';

  // Handle your custom ApiError
  if ('statusCode' in error && error.statusCode) {
    statusCode = error.statusCode;
  }

  if ('status' in error && error.status) {
    status = error.status;
  }

  // Example: handle duplicate key error (Postgres unique violation)
  if ('code' in error && error.code === '23505') {
    statusCode = 400;
    message = 'Duplicate value error';
  }

  // JWT expired error example
  if (error.message === 'jwt expired') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  res.status(statusCode).json({
    statusCode,
    status,
    message,
  });
};

export default errorHandler;
