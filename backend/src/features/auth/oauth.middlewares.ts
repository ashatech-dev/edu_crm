import { Request, Response, NextFunction } from "express";
import { isValidOauthParams, sanitizeQuery } from "./oauth.dto";

export function oauthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { code } = sanitizeQuery(req.query);

    console.log({ code });

    const oauth_provider = req.cookies?.oauth_provider;

    if (isValidOauthParams(code) && oauth_provider) {
      let redirectTarget = "";

      switch (oauth_provider) {
        case "google":
          redirectTarget = `/auth/google/callback`;
          break;
        case "github":
          redirectTarget = `/auth/github/callback`;
          break;
        default: {
          res.status(400).json({ error: "Unsupported OAuth provider" });
          return;
        }
      }

      console.log({ original_url: req.originalUrl });

      res.redirect(redirectTarget + req.originalUrl);
      return;
    }

    next();
  } catch (err) {
    console.error("OAuth middleware error", err);
    return next(err);
  }
}
