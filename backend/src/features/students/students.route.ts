import { Router } from "express";
import * as StudentController from "./students.controller";
import { catchAsyncMiddleware } from "../../shared/middlewares/catchAsync.middleware";
// import { VerifyAccessTokenMiddleWare } from "../../shared/middlewares/VerifyAccessToken";

export const StudentRouter: Router = Router();

StudentRouter.post(
  "/",
  catchAsyncMiddleware(StudentController.createStudent, {
    message: "Creating student failed!",
    status: 500,
  })
);
StudentRouter.get(
  "/",
  catchAsyncMiddleware(StudentController.FetchStudentList, {
    message: "All student fetch failed!",
    status: 500,
  })
);
StudentRouter.get(
  "/:id",
  catchAsyncMiddleware(StudentController.FetchStudentById, {
    message: "Single student fetch failed!",
    status: 500,
  })
);
