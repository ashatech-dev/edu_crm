import z from "zod"
import { instituteParamsZodSchema, instituteUpdateZodSchema, instituteZodSchema } from "./institute.dto"

export interface IInstituteDocument {
    name: string,
    emailDomain: string,
    createdAt?: Date | string,
    updatedAt?: Date | string
}

export type InstituteInputZodType=z.infer<typeof instituteZodSchema>
export type InstituteDeleteZodType=z.infer<typeof instituteParamsZodSchema>
export type InstituteUpdateZodType=z.infer<typeof instituteUpdateZodSchema>