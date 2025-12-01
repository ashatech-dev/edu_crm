import { Types } from "mongoose";

export function toIdString(id: unknown): string {
    if (typeof id === "string") return id;
    const anyId = id as Types.ObjectId;
    if (anyId && typeof anyId.toHexString === "function") {
        return anyId.toHexString();
    }
    if (anyId && typeof anyId.toString === "function") {
        const s = anyId.toString();
        const match = s.match(/[0-9a-fA-F]{24}/);
        if (match) return match[0];
        return s;
    }
    throw new Error("Invalid ObjectId-like value");
}