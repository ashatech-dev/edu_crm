import { addMinutes } from "date-fns";
import axios from "axios";
import * as AuthInterface from "./auth.interface";
import { OTPValidationModel } from "./otp.model";
import { verifyHash, hashing } from "./auth.utils";
import {
  generateLoginTokens,
  decodeToken,
} from "../../shared/utils/auth.tokens";
import AppError from "../../shared/utils/AppError";
import { generateSecureOtp } from "../../shared/utils/otpGeneration";
import { sendMailService } from "../../shared/emails/mailer";
import { getOTPEmailTemplate } from "../../shared/emails/templates/sendOTPMail";
import { ENV_CONFIGS } from "../../shared/config/envs.config";
import { withTransaction } from "../../shared/utils/withTransaction";
import { UsersAPI } from "../users/user.api";
import { createAuthRepository } from "./auth.repository";
import mongoose, { Types } from "mongoose";
import { toIdString } from "../../shared/utils/mongooseConverters";

const authRepo = createAuthRepository(OTPValidationModel);

export const registerUser = async (
  payload: AuthInterface.RegisterUserInputZodType
) => {
  return await withTransaction(async (session) => {
    const savedUser = await UsersAPI.create({
      ...payload,
      provider: [AuthInterface.LOGIN_PROVIDER.EMAIL],
      roles: [AuthInterface.ROLE.CLIENT],
    });

    const otp = generateSecureOtp();
    const expiresAt = addMinutes(new Date(), 10);

    await authRepo.createOTPs(
      [
        {
          userId: savedUser._id as unknown as mongoose.Types.ObjectId,
          type: "email",
          otp,
          expiresAt,
        },
      ],
      session
    );

    try {
      await sendMailService(
        savedUser.email,
        savedUser?.name || "User",
        getOTPEmailTemplate,
        [otp]
      );
    } catch (err) {
      if (process.env.ENABLE_TRANSACTIONS !== "true") {
        await UsersAPI.softDeleteById(String(savedUser._id));
        await authRepo.deleteOTPsForUserByType(String(savedUser._id), "email");
      }
      console.log({ err });
      throw new AppError(
        "Failed to send OTP email. Rollbacked User. Reinitiate Login!",
        500
      );
    }

    const safeUser: Omit<AuthInterface.IUserPublic, "password"> | null =
      savedUser.toObject();
    if (safeUser && "password" in safeUser) delete safeUser.password;

    return { ...safeUser, _id: toIdString(savedUser._id) };
  });
};

// OTP verification and marking as consumed
export async function verifyOtpService(
  userId: string,
  otp: string,
  type: "email" | "phone" | "password_reset"
) {
  const record = await authRepo.findLatestOTPForUser(userId, type);

  if (!record) throw new AppError("OTP not found", 400);
  if (record.otp !== otp) throw new AppError("Invalid OTP", 401);
  if (record.expiresAt < new Date()) throw new AppError("OTP expired", 401);

  await authRepo.consumeOTP(record.id);

  if (type === "email") {
    await UsersAPI.verifyEmail(userId);
  }

  return { success: true };
}

export const loginUser = async (
  payload: AuthInterface.LoginUserInputZodType
) => {
  const userDoc = await UsersAPI.findByEmailWithPassword(payload.email);
  if (!userDoc) throw new AppError("Invalid email or password", 401);

  if (userDoc.lockoutUntil && userDoc.lockoutUntil > new Date()) {
    throw new AppError("Account locked. Try again later.", 423);
  }

  const isValid = await verifyHash(payload.password, userDoc.password);
  if (!isValid) {
    await UsersAPI.incrementFailedLogin(String(userDoc._id));
    throw new AppError("Invalid email or password", 401);
  }

  const tokens = await generateLoginTokens({
    email: payload.email,
    uid: String(userDoc._id),
    role: userDoc.roles?.[0] || AuthInterface.ROLE.CLIENT,
  });

  if (Array.isArray(userDoc.refreshToken)) {
    if (userDoc.refreshToken.length >= 4) userDoc.refreshToken.splice(-3);
    userDoc.refreshToken.push(tokens.refreshToken);
  } else {
    userDoc.refreshToken = [tokens.refreshToken];
  }
  await userDoc.save();

  await UsersAPI.setLastLogin(String(userDoc._id));

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    password: _password,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    refreshToken: _refreshToken,
    _id,
    ...userWithoutPassword
  } = userDoc.toObject();

  return { tokens, user: { ...userWithoutPassword, _id: toIdString(_id) } };
};

// Refresh token handler
export const handleRefreshToken = async (oldToken: string) => {
  const decoded = await decodeToken(oldToken);
  const { uid } = decoded?.data || {};

  if (!uid) throw new AppError("Unauthorized", 403);

  const userDoc = await UsersAPI.findByRefreshToken(oldToken);
  if (!userDoc) throw new AppError("Unauthorized", 403);

  const tokens = await generateLoginTokens({
    email: userDoc.email,
    uid: String(userDoc._id),
    role: userDoc.roles?.[0] || AuthInterface.ROLE.CLIENT,
  });

  userDoc.refreshToken = userDoc.refreshToken.filter(
    (e: string) => e !== oldToken
  );
  userDoc.refreshToken.push(tokens.refreshToken);
  await userDoc.save();

  return tokens;
};

// Forgot password - send OTP
export async function forgotPasswordService(
  input: AuthInterface.ForgotPasswordInputZodType
) {
  const user = await UsersAPI.findByEmail(input.email);
  if (!user) throw new AppError("User not found", 400);

  const otp = generateSecureOtp();
  const expiresAt = addMinutes(new Date(), 10);
  const userId = new Types.ObjectId(user._id);

  await authRepo.createOTPs([
    {
      userId,
      otp,
      type: "password_reset",
      expiresAt,
    },
  ]);

  await sendMailService(user.email, user.name || "User", getOTPEmailTemplate, [
    otp,
  ]);

  return { message: "OTP sent to your email" };
}

export async function verifyForgotPasswordService(
  input: AuthInterface.VerifyForgotPasswordInputZodType
) {
  const user = await UsersAPI.findByEmail(input.email);
  if (!user) throw new AppError("User not found", 400);

  const record = await authRepo.findLatestOTPForUser(
    String(user._id),
    "password_reset"
  );

  if (!record) throw new AppError("OTP not found", 401);
  if (record.otp !== input.otp) throw new AppError("Invalid OTP", 401);
  if (record.expiresAt < new Date()) throw new AppError("OTP expired", 401);
  await authRepo.consumeOTP(record.id);

  const hashed = await hashing(input.newPassword);
  await UsersAPI.changePassword(String(user._id), hashed);

  // Will see in future
  // await UsersAPI.updateById(String((user as any)._id), {
  //   $addToSet: { provider: AuthInterface.LOGIN_PROVIDER.EMAIL },
  // } as any);

  return { message: "Password updated successfully" };
}

// Google login callback
export async function googleLoginCallbackService(
  query: AuthInterface.OAuthCodeZodType
) {
  const { code } = query;

  const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    {
      client_id: ENV_CONFIGS.GOOGLE_CLIENT_ID,
      client_secret: ENV_CONFIGS.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: ENV_CONFIGS.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }
  );

  const { access_token } = tokenResponse.data;

  const profileResponse = await axios.get(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );

  const { email, name, picture } = profileResponse.data;

  let user = await UsersAPI.findByEmail(email);
  if (!user) {
    user = await UsersAPI.create({
      email,
      name,
      avatar: picture,
      provider: [AuthInterface.LOGIN_PROVIDER.GOOGLE],
      roles: [AuthInterface.ROLE.CLIENT],
    });
  }

  // Add logic
  if (!user) return;

  const tokens = await generateLoginTokens({
    uid: String(user._id),
    email: user.email,
    role: (user.roles?.[0] as AuthInterface.ROLE) || AuthInterface.ROLE.CLIENT,
  });

  return {
    data: {
      id: String(user._id),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      accessToken: tokens.accessToken,
    },
    refreshToken: tokens.refreshToken,
  };
}

export async function facebookLoginCallbackService(
  query: AuthInterface.OAuthCodeZodType
) {
  const { code } = query;

  const { data } = await axios.get(
    `https://graph.facebook.com/v13.0/oauth/access_token?client_id=${ENV_CONFIGS.FACEBOOK_CLIENT_ID}&client_secret=${ENV_CONFIGS.FACEBOOK_CLIENT_SECRET}&code=${code}&redirect_uri=${ENV_CONFIGS.FACEBOOK_REDIRECT_URI}`
  );

  const { access_token } = data;

  const { data: profile } = await axios.get(
    `https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`
  );

  console.log({ profile });

  // to be decided in future
  return {};
}

export async function logoutService(refreshToken: string) {
  const { data } = await decodeToken(refreshToken);
  authRepo.findByIdAndUpdate(data.uid, {
    refreshToken: { $pull: refreshToken }
  });
}