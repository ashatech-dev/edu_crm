import { Request, Response } from "express";
import { createAttendanceService, fetchAttendanceService } from "./attendance.service";
import { SendResponse } from "../../shared/utils/JsonResponse";

export const createAttendance=async(req:Request,res:Response)=>{
      const attendance=await createAttendanceService(req.body)
      SendResponse(res,{data:attendance,status_code:201,message:"Created Attendance successfully!"})
}

export const fetchAttendance=async(req:Request,res:Response)=>{
      const attendance=await fetchAttendanceService()
      SendResponse(res,{data:attendance,status_code:200,message:"fetch Attendance successfully!"})
}