import { Model, HydratedDocument, FilterQuery, UpdateQuery } from "mongoose";

export function createBaseRepository<T>(model: Model<T>) {
  const create = (data: Partial<T>): Promise<HydratedDocument<T>> => {
    return model.create(data);
  };

  const findById = (id: string): Promise<HydratedDocument<T> | null> => {
    return model.findById(id).exec();
  };

  const findByIdLean = (id: string): Promise<T | null> => {
    return model.findById(id).lean<T>().exec();
  };

  const findByIdAndUpdate = (
    id: string,
    update: UpdateQuery<T>
  ): Promise<HydratedDocument<T> | null> => {
    return model.findByIdAndUpdate(id, update, { new: true }).exec();
  };

  const findByIdAndDelete = (
    id: string
  ): Promise<HydratedDocument<T> | null> => {
    return model.findByIdAndDelete(id).exec();
  };

  const findAll = (
    filter: FilterQuery<T> = {}
  ): Promise<HydratedDocument<T>[] | null> => {
    return model.find(filter).exec();
  };

  const findAllLean = (filter: FilterQuery<T> = {}): Promise<T[] | null> => {
    return model.find(filter).lean<T[]>().exec();
  };

  return {
    create,
    findById,
    findByIdLean,
    findByIdAndUpdate,
    findByIdAndDelete,
    findAll,
    findAllLean,
  };
}
