import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

export const catchAsyncMiddleware = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  error: {
    message: string;
    status?: number;
  } = {
    message: "Unexpected Error!",
    status: 500,
  }
) => {
  return function (req: Request, res: Response, next: NextFunction) {
    return fn(req, res, next).catch((err: Error) => {
      if (err instanceof AppError) {
        next(err); 
      } else {
        // Log unexpected errors for debugging
        console.error('Unexpected error in route:', {
          url: req.url,
          method: req.method,
          error: err.message,
          stack: err.stack
        });
        next(new AppError(error.message, error.status));
      }
    });
  };
};
