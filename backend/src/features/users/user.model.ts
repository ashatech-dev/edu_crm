import { Document, model, Schema } from "mongoose";
import { hashing } from "../auth/auth.utils";
import {
  LOGIN_PROVIDER,
  ROLE
} from "../auth/auth.interface";
import AppError from "../../shared/utils/AppError";
import { GENDER, IUserStoredDocument } from "./user.interface";

const UserSchema = new Schema<IUserStoredDocument>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, unique: true, sparse: true },
    gender: { type: String, enum: Object.values(GENDER) },
    provider: {
      type: [String],
      required: true,
      enum: Object.values(LOGIN_PROVIDER),
      default: [LOGIN_PROVIDER.EMAIL],
    },
    roles: {
      type: [String],
      enum: Object.values(ROLE),
      default: [ROLE.CLIENT],
      validate: {
        validator: (arr: string[]) =>
          Array.isArray(arr) && new Set(arr).size === arr.length,
        message: "Duplicate roles are not allowed",
      },
    },

    password: { type: String },
    avatar: String,

    refreshToken: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: (val: string[]) => val.length <= 4,
        message: "Maximum 4 refresh tokens allowed",
      },
    },

    isVerified: { type: Boolean, default: false },

    emailVerifiedAt: { type: Date, default: null },
    phoneVerifiedAt: { type: Date, default: null },

    passwordChangedAt: { type: Date, default: null },

    failedLoginAttempts: { type: Number, default: 0, min: 0 },
    lockoutUntil: { type: Date, default: null },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "DELETED", "PENDING"],
      default: "ACTIVE",
      index: true,
    },
    defaultAddressId: { type: Schema.Types.ObjectId, ref: "Address" },
    deletedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    autoIndex: true,
  }
);

UserSchema.pre("save", async function (next) {
  const user = this as IUserStoredDocument & Document;

  const isEmailProvider =
    Array.isArray(user.provider) &&
    (user.provider as string[]).includes(LOGIN_PROVIDER.EMAIL);

  if (!isEmailProvider) return next();

  if (!user.isModified("password")) return next();

  try {
    user.password = await hashing(user.password);
    user.passwordChangedAt = new Date();
    next();
  } catch (err) {
    console.error(err);
    next(new AppError("Unexpected Error!", 500));
  }
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ status: 1, updatedAt: -1 });

export const UserModel = model("User", UserSchema);
