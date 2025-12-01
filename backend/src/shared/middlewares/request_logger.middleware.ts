import { NextFunction, Request, Response } from "express";

export default function RequestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const time = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);

    const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${time} ms`;
    console.log(log);
  });

  next();
}
