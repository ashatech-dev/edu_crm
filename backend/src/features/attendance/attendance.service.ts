import { Types } from "mongoose"
import { AttendanceModel } from "./attendance.model"
import AppError from "../../shared/utils/AppError"
import { attendanceZodType } from "./attendance.interface"

export const createAttendanceService=async function name(payload:attendanceZodType) {
    if(!Types.ObjectId.isValid(payload.instituteId)) throw new AppError("Invalid Institute Id",400)
    if(!Types.ObjectId.isValid(payload.staffId)) throw new AppError("Invalid Staff Id",400)
    if(!Types.ObjectId.isValid(payload.studentId)) throw new AppError("Invalid Student Id",400)
    await AttendanceModel.create(payload)
}

export const fetchAttendanceService=async function name() {
   const attendance=await AttendanceModel.find({})
   return attendance
}