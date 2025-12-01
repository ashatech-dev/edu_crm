import mongoose from "mongoose";

type WithTransactionHandler<T> = (
  session: mongoose.ClientSession
) => Promise<T>;

export const withTransaction = async <T>(
  handler: WithTransactionHandler<T>
): Promise<T> => {
  const session = await mongoose.startSession();

  const transactionsEnabled = process.env.ENABLE_TRANSACTIONS === "true";

  if (transactionsEnabled) {
    let result: T;

    try {
      session.startTransaction();
      result = await handler(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return result;
  } else {
    try {
      const result = await handler(session);
      return result;
    } finally {
      session.endSession();
    }
  }
};
