import z from "zod";

const name=z.string().min(3).max(100)
const emailDomain=z.string().email("Invalid Email Format!")
export const instituteZodSchema=z.object({
    name:name,
    emailDomain:emailDomain,
    createdAt:z.coerce.date(),
    updatedAt:z.coerce.date().optional()
})
  
export const instituteParamsZodSchema=z.object({
   id:z.string().min(24).max(24)})
  
export const instituteUpdateZodSchema=z.object({
    name:name
}).partial()