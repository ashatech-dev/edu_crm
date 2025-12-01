import { Model, Document } from "mongoose";
import { UserModel } from "./user.model";
import { createUserRepository } from "./user.repository";
import { IUserStoredDocument } from "./user.interface";

const userRepo = createUserRepository(
  UserModel as unknown as Model<IUserStoredDocument>
);

export type CreateUserInput = Partial<IUserStoredDocument> & {
  name: string;
  email: string;
  password?: string;
  provider: string[];
  roles?: string[];
  phone?: string;
  gender?: string;
};

export const UsersAPI = {
  create: (data: CreateUserInput) => userRepo.create(data),
  findById: (id: string) => userRepo.findById(id),
  updateById: (id: string, data: Partial<IUserStoredDocument>) =>
    userRepo.updateById(id, data),
  softDeleteById: (id: string) =>
    userRepo.updateById(id, { status: "DELETED", deletedAt: new Date() }),

  findByEmail: (email: string): Promise<IUserStoredDocument | null> =>
    userRepo.findByEmail(email),

  findVerifiedUsers: (): Promise<IUserStoredDocument[]> =>
    userRepo.findVerifiedUsers(),

  findByIdWithPassword: (
    uid: string
  ): Promise<(IUserStoredDocument & Document) | null> =>
    userRepo.findByIdWithPassword(uid),

  findByEmailWithPassword: (
    email: string
  ): Promise<(IUserStoredDocument & Document) | null> =>
    userRepo.findByEmailWithPassword(email),

  findByRefreshToken: (token: string) =>
    (UserModel as unknown as Model<IUserStoredDocument>)
      .findOne({ refreshToken: token }, { email: 1, roles: 1, refreshToken: 1 })
      .exec(),

  revokeRefreshToken: (token: string) => {
    UserModel.findOneAndUpdate({ refreshToken: token }, {
      $unset: {
        refreshToken: token
      }
    })
  },

  async setLastLogin(
    uid: string,
    meta?: { ip?: string; userAgent?: string }
  ): Promise<IUserStoredDocument | null> {
    return userRepo.updateById(uid, {
      lastLoginAt: new Date(),
      ...(meta?.ip ? { lastLoginIP: meta.ip } : {}),
      ...(meta?.userAgent ? { lastLoginUserAgent: meta.userAgent } : {}),
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });
  },

  async incrementFailedLogin(uid: string, threshold = 5, lockoutMinutes = 15) {
    const user = await userRepo.findById(uid);
    if (!user) return null;

    const nextCount = (user.failedLoginAttempts || 0) + 1;
    const lockoutUntil =
      nextCount >= threshold
        ? new Date(Date.now() + lockoutMinutes * 60_000)
        : null;

    return userRepo.updateById(uid, {
      failedLoginAttempts: nextCount,
      lockoutUntil,
    });
  },

  async changePassword(uid: string, hashedPassword: string) {
    return userRepo.updateById(uid, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    });
  },

  async activateUser(uid: string) {
    return userRepo.updateById(uid, {
      status: "ACTIVE",
      deletedAt: null,
    });
  },

  async deactivateUser(uid: string) {
    return userRepo.updateById(uid, {
      status: "SUSPENDED",
    });
  },

  async verifyEmail(uid: string) {
    return userRepo.updateById(uid, {
      isVerified: true,
      emailVerifiedAt: new Date(),
    });
  },

  async verifyPhone(uid: string) {
    return userRepo.updateById(uid, {
      isVerified: true,
      phoneVerifiedAt: new Date(),
    });
  },
};
