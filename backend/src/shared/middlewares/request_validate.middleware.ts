import { ZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import AppError from "../../shared/utils/AppError";

type ZodSchema = {
  body?: ZodObject;
  query?: ZodObject;
  params?: ZodObject;
};


export const requestValidateRequest =
  (schema: ZodSchema) =>
    (req: Request, _: Response, next: NextFunction): void => {
      try {
        if (schema.body) schema.body.safeParse(req.body);
        if (schema.query) schema.query.safeParse(req.query);
        if (schema.params) schema.params.safeParse(req.params);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors = error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          }));

          const message = formattedErrors
            .map((err) => `${err.field}: ${err.message}`)
            .join(", ");

          return next(new AppError(message, 400));
        }

        return next(new AppError("Validation failed", 400));
      }
    };

