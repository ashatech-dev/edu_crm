import { Router } from "express";
import { requestValidateRequest } from "../../shared/middlewares/request_validate.middleware";
import { catchAsyncMiddleware } from "../../shared/middlewares/catchAsync.middleware";
import { AttendanceZodInputSchema, AttendaneQuery } from "./attendance.dto";
import { createAttendance, fetchAttendance } from "./attendance.controller";

const attendanceRouter: Router = Router()

attendanceRouter.post(
  "/sessions",
  requestValidateRequest({ body: AttendanceZodInputSchema }),
  catchAsyncMiddleware(createAttendance, {
    message: "failed to create",
    status: 500,
  })
);
attendanceRouter.get(
  "/sessions",
  requestValidateRequest({ query: AttendaneQuery }),
  catchAsyncMiddleware(fetchAttendance, {
    message: "failed to fetch",
    status: 500,
  })
);
attendanceRouter.get(
  "/sessions",
  requestValidateRequest({ query: AttendaneQuery }),
  catchAsyncMiddleware(fetchAttendance, {
    message: "failed to fetch",
    status: 500,
  })
);
