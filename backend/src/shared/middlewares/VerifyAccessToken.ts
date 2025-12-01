import type { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import { decodeToken } from "../utils/auth.tokens";

function extractBearerToken(req: Request): string | null {
  const auth = req.headers["authorization"];
  if (typeof auth === "string") {
    const match = auth.trim().match(/^Bearer\s+(.+)$/i);
    if (match && match[1]) return match[1].trim();
  }

  const cookieRaw = req.cookies?.["accessToken"];
  if (typeof cookieRaw === "string") {
    const cookie = cookieRaw.trim();
    const match = cookie.match(/^Bearer\s+(.+)$/i);
    return (match && match[1]) ? match[1].trim() : cookie;
  }

  return null;
}

export async function VerifyAccessTokenMiddleWare(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return next(new AppError("ACCESS TOKEN NOT FOUND", 401));
    }

    const data = await decodeToken(token);

    if (!data || typeof data !== "object" || !("data" in data)) {
      return next(new AppError("Invalid access token", 401));
    }

    req.user = data.data;

    return next();
  } catch {
    return next(new AppError("Invalid access token", 401, 40101));
  }
}
