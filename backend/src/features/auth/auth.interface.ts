// auth.ts
import { z } from "zod";
import AuthValidations from "./auth.dto";
import { GENDER } from "../users/user.interface";
import { Types } from "mongoose";

// Auth-only enums (login provider, role) and auth response types

export enum LOGIN_PROVIDER {
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  EMAIL = "EMAIL",
}

export enum ROLE {
  CLIENT = "CLIENT",
  VENDOR = "VENDOR",
  ADMIN = "ADMIN",
}

// Public user view for auth responses (no sensitive fields)
export interface IUserPublic {
  // from user base
  name?: string;
  email: string;
  phone?: string;
  gender?: GENDER;


  // auth presentation
  avatar?: string;
  provider: LOGIN_PROVIDER[];
  isVerified: boolean;
  status?: "ACTIVE" | "SUSPENDED" | "DELETED" | "PENDING";
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLoginAt?: Date | string;
  emailVerifiedAt?: Date | string | null;
  phoneVerifiedAt?: Date | string | null;

  // address
  defaultAddressId: Types.ObjectId;

  // roles attached for authorization
  roles?: ROLE[];
}

// Authentication response payload
export interface ILoginResponse extends IUserPublic {
  accessToken: string;
  _id?: string;
}

// Zod request types (auth API contracts)
export type ForgotPasswordInputZodType = z.infer<
  typeof AuthValidations.forgotPasswordZodSchema
>;
export type VerifyForgotPasswordInputZodType = z.infer<
  typeof AuthValidations.verifyForgotPasswordZodSchema
>;
export type RegisterUserInputZodType = z.infer<
  typeof AuthValidations.registerUserZodSchema
>;
export type LoginUserInputZodType = z.infer<
  typeof AuthValidations.loginUserZodSchema
>;
export type ResetPasswordInputZodType = z.infer<
  typeof AuthValidations.resetPasswordZodSchema
>;
export type OAuthCodeZodType = z.infer<
  typeof AuthValidations.OAuthCodeZodSchema
>;
