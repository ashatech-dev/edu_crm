import z from "zod";

const code=z.string().min(3,"code is required")

export const CourseZodSchema =z.object({
  instituteId:z.string().length(24),
  name:z.string().min(3,"Min 3 character is required").max(50, "Max 50 character is required"),
  code:code,
  durationMonths: z.number().positive(),
  credits:z.number().positive(),
  feeAmount: z.number().int().nonnegative(),
  description: z.string().min(1,"description is required"),
  prerequisites:z.array(z.string()).default([]),
  createdAt:z.coerce.date().optional(),
  updatedAt:z.coerce.date().optional()
});

export const CourseParamsZodSchema=z.object({
  id:z.string().regex(/^[0-9a-f]{24}$/,"Invalid object Id")
})

export const CourseQueryZodSchema=z.object({
  code:code.optional()
})