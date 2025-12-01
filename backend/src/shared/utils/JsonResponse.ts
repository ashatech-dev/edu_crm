

import type { Response } from "express";
import { z, ZodTypeAny, ZodError } from "zod";

type EnvelopeWithStatusCode = { status_code: number };

type SafeSuccess<T> = { success: true; data: T };
type SafeFailure = { success: false; error: ZodError };
type status = "success" | "error";

function hasStatusCode(x: unknown): x is EnvelopeWithStatusCode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!x && typeof (x as any).status_code === "number";
}

type JSONResponseType = {
  data?: unknown;
  meta?: unknown;
  status_code?: number;
  application_code?: number;
  message?: string;
  status?: status;
};

function formatZodIssues(err: ZodError) {
  return err.issues.map((i) => ({
    path: i.path.join("."),
    code: i.code,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expected: (i as any).expected,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    received: (i as any).received,
    message: i.message,
  }));
}

const DefaultEnvelopeSchema = z.object({
  status_code: z.number().int().min(100).max(599),
}).loose();

export function SendResponse<TSchema extends ZodTypeAny | undefined>(
  resObject: Response,
  response: JSONResponseType,
  schema?: TSchema
) {

  response.status! = response.status || "success";
  response.status_code! = response.status_code || 200;
  response.application_code! = response.application_code || response.status_code;
  response.message = response.message || "Operation Success";

  if (!schema) {
    const sc =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response && typeof (response as any).status_code === "number"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (response as any).status_code
        : 200;
    return resObject.status(sc).json(response);
  }

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const parsed = (schema as ZodTypeAny).parse(response) as z.infer<
      Exclude<TSchema, undefined>
    >;
    if (!hasStatusCode(parsed)) {
      const minimal = DefaultEnvelopeSchema.parse(response) as EnvelopeWithStatusCode;
      return resObject.status(minimal.status_code).json(parsed);
    }
    return resObject.status(parsed.status_code).json(parsed);
  }

  const result = (schema as ZodTypeAny).safeParse(response) as
    | SafeSuccess<z.infer<Exclude<TSchema, undefined>>>
    | SafeFailure;

  if (!result.success) {
    const issues = formatZodIssues(result.error);
    const correlationId = resObject.getHeader("x-correlation-id") || crypto.randomUUID?.();
    console.error("Response schema violation", {
      correlationId,
      route: resObject.req?.originalUrl,
      method: resObject.req?.method,
      issues,
    });
    return resObject.status(500).json({
      data: null,
      status_code: 500,
      application_code: 500,
      message: "Internal Server Error",
      status: "error",
    });
  }

  if (!hasStatusCode(result.data)) {
    try {
      const minimal = DefaultEnvelopeSchema.parse(response) as EnvelopeWithStatusCode;
      return resObject.status(minimal.status_code).json(result.data);
    } catch {
      console.error("Validated payload lacks status_code");
      return resObject.status(500).json({
        data: null,
        status_code: 500,
        application_code: 500,
        message: "Internal Server Error",
        status: "error",
      });
    }
  }

  return resObject.status(result.data.status_code).json(result.data);
}
