import { Types } from "mongoose";
import AppError from "../../shared/utils/AppError";
import { UserRoles } from "../../shared/constants";
import { hashing, verifyHash } from "../auth/auth.utils";
import { createUserRepository } from "./user.repository";
import { UserModel } from "./user.model";
import { IUserStoredDocument } from "./user.interface";

const userRepo = createUserRepository(UserModel);

export async function getAllUsersService() {
  const users = await userRepo.findAllLean();

  return users!.map((user: Omit<IUserStoredDocument, "password">) => {
    if ("password" in user) delete user.password;

    return { ...user };
  });
}

export const getAllRolesService = async () => {
  return UserRoles;
};

export const getUserByIdService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid User ID", 400);

  const user: Omit<IUserStoredDocument, "password"> | null =
    await userRepo.findByIdLean(id);

  if (!user) throw new AppError("User not found", 404);

  if ("password" in user) delete user.password;

  return user;
};

export const updateUserByIdService = async (
  id: string,
  updateData: Partial<IUserStoredDocument>
) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid User ID", 400);

  const user: Omit<IUserStoredDocument, "password"> | null =
    await userRepo.findByIdAndUpdate(id, updateData);

  if (!user) throw new AppError("User not found", 404);

  if ("password" in user) delete user.password;

  return user;
};

export const getUserActivityService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid User ID", 400);

  const user = await userRepo.findByIdLean(id);
  if (!user) throw new AppError("User not found", 404);

  return {
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    activityScore: 0,
  };
};

export const deleteUserByIdService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid User ID", 400);

  const deleted = await userRepo.findByIdAndDelete(id);
  if (!deleted) throw new AppError("User not found", 404);
};

export const getMeService = async (uid: string) => {
  if (!Types.ObjectId.isValid(uid)) throw new AppError("Invalid User ID", 400);

  const user: Omit<IUserStoredDocument, "password"> | null =
    await userRepo.findByIdLean(uid);
  if (!user) throw new AppError("User not found", 404);

  if ("password" in user) delete user.password;

  return user;
};

export async function updateOwnProfileService(
  uid: string,
  updateData: Partial<{ name: string; phone: string; avatar: string }>
) {
  if (!uid) throw new AppError("Unauthorized user", 401);

  const user = await userRepo.findById(uid);
  if (!user) throw new AppError("User not found", 404);

  if (updateData.name !== undefined) user.name = updateData.name;
  if (updateData.phone !== undefined) user.phone = updateData.phone;
  if (updateData.avatar !== undefined) user.avatar = updateData.avatar;

  await user.save();

  const safeUser: Omit<IUserStoredDocument, "password"> | null = user.toObject();
  if ("password" in safeUser) delete safeUser.password;

  return safeUser;
}

export async function changePasswordService(
  uid: string,
  oldPassword: string,
  newPassword: string
) {
  if (!uid) throw new AppError("Unauthorized user", 401);

  const user = await userRepo.findByIdWithPassword(uid);
  if (!user) throw new AppError("User not found", 404);

  const isMatch = await verifyHash(oldPassword, user.password);
  if (!isMatch) throw new AppError("Old password is incorrect", 400);

  const hashed = await hashing(newPassword);
  user.password = hashed;

  await user.save();
}

export async function verifyEmailService(uid: string) {
  const user = await userRepo.findById(uid);
  if (!user) throw new AppError("User not found", 404);

  if (user.isVerified) throw new AppError("Email already verified", 400);

  user.isVerified = true;
  await user.save();

  return { email: user.email, verified: true };
}
