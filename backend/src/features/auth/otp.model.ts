import mongoose, { Document, Model, Schema } from "mongoose";

export type OTPValidationType = "email" | "phone" | "password_reset";

export interface IOTPValidation extends Document {
  userId: mongoose.Types.ObjectId;
  type: OTPValidationType;
  otp: string;
  attempts: number;
  expiresAt: Date;
  consumed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OTPValidationSchema = new Schema<IOTPValidation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["email", "phone", "password_reset"],
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

OTPValidationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTPValidationModel: Model<IOTPValidation> =
  mongoose.models.OTPValidation ||
  mongoose.model<IOTPValidation>("OTPValidation", OTPValidationSchema);
