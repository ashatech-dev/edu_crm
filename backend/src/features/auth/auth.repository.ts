import { IOTPValidation } from "./otp.model";
import { createBaseRepository } from "../../shared/respository/base.repository";

import { FilterQuery, UpdateQuery, HydratedDocument, Model } from "mongoose";

export interface AuthRepository {
  create(
    data: Partial<IOTPValidation>
  ): Promise<HydratedDocument<IOTPValidation>>;
  findById(id: string): Promise<HydratedDocument<IOTPValidation> | null>;
  findByIdLean(id: string): Promise<IOTPValidation | null>;
  findByIdAndUpdate(
    id: string,
    update: UpdateQuery<IOTPValidation>
  ): Promise<HydratedDocument<IOTPValidation> | null>;
  findByIdAndDelete(
    id: string
  ): Promise<HydratedDocument<IOTPValidation> | null>;
  findAll(
    filter?: FilterQuery<IOTPValidation>
  ): Promise<HydratedDocument<IOTPValidation>[] | null>;
  findAllLean(
    filter?: FilterQuery<IOTPValidation>
  ): Promise<IOTPValidation[] | null>;

  findLatestOTPForUser(
    userId: string,
    type: string
  ): Promise<IOTPValidation | null>;
  consumeOTP(otpId: string): Promise<IOTPValidation | null>;
  createOTPs(
    otpDataArray: Partial<IOTPValidation>[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session?: any
  ): Promise<IOTPValidation[]>;
  deleteOTPsForUserByType(
    userId: string,
    type: string
  ): Promise<{ deletedCount?: number }>;
}

export function createAuthRepository(
  model: Model<IOTPValidation>
): AuthRepository {
  const baseRepo = createBaseRepository<IOTPValidation>(model);

  const findLatestOTPForUser = (userId: string, type: string) => {
    return model
      .findOne({ userId, type, consumed: false })
      .sort({ createdAt: -1 })
      .exec();
  };

  const consumeOTP = (otpId: string) => {
    return model
      .findByIdAndUpdate(otpId, { consumed: true }, { new: true })
      .exec();
  };

  const createOTPs = (
    otpDataArray: Partial<IOTPValidation>[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session?: any
  ) => {
    return model.create(otpDataArray, { session });
  };

  const deleteOTPsForUserByType = (userId: string, type: string) => {
    return model.deleteMany({ userId, type }).exec();
  };

  return {
    ...baseRepo,
    findLatestOTPForUser,
    consumeOTP,
    createOTPs,
    deleteOTPsForUserByType,
  };
}
