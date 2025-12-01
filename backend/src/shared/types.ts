import "express";
import { ROLE } from "../features/auth/auth.interface";

declare module "express" {
    export interface Request {
        user?: User;
    }
}

export interface User {
    email: string;
    role: ROLE | ROLE[];
    uid: string;
}
