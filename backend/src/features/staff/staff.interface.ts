import { Types } from "mongoose";
import { staffQueryZod, staffZodSchema } from "./staff.dto";
import z from "zod";

export interface IStaff{
      instituteId:Types.ObjectId,
      userId: Types.ObjectId,
      employeeId: string,
      department: string,
      qualification: string,
      dateOfJoining: Date,
      salaryGrade?: string,
      createdAt?: Date,
      updatedAt?:Date
}

export type staffZodType=z.infer<typeof staffZodSchema>
export type staffZodQueryType=z.infer<typeof staffQueryZod>