import { IUserPublic, ROLE } from "../auth/auth.interface";

export enum GENDER {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
}

export const GENDER_ARRAY = ["MALE", "FEMALE", "OTHER"]

// Core, minimal user base
export interface IUserBase {
    name?: string;
    email: string;
    phone?: string;
    gender?: GENDER;
    roles?: ROLE[];
}

// Persisted public fields in storage layer
export interface IUserStoredPublic extends IUserPublic {
    failedLoginAttempts?: number;
    lockoutUntil?: Date | string | null;
    deletedAt?: Date | string | null;
}

// Full stored document (includes sensitive/operational fields)
export interface IUserStoredDocument extends IUserStoredPublic {
    _id: string;
    password: string;
    refreshToken: string[];
    passwordChangedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}
