import z from "zod";
const  department=z.string().min(3,"department is required")
export const staffZodSchema = z.object({
    instituteId: z.string().regex(/^[0-9a-f]{24}$/, "Invalid Institute  ID"),
    userId: z.string().regex(/^[0-9a-f]{24}$/, "Invalid User ID"),
    employeeId: z.string().min(3,"Min 3 character employee Id").max(20,"Max 20 character is required employee Id"),
    department:department,
    qualification: z.string().min(2,"qualification is required"),
    dateOfJoining: z.coerce.date(),
    salaryGrade:z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional()
})

export const staffParamsZod=z.object({
    id:z.string().regex(/^[0-9a-f]{24}$/, "Invalid Staff ID"),
})

export const staffQueryZod=z.object({
    department:department.optional()
})