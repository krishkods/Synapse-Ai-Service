import { Document, Model, Schema, model, models } from "mongoose";

export interface IApiKey extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  prefix: string;
  keyHash: string;
  lastFour: string;
  namespace: string;
  isActive: boolean;
  lastUsedAt?: Date | null;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    prefix: { type: String, required: true, trim: true, index: true },
    keyHash: { type: String, required: true, unique: true, index: true },
    lastFour: { type: String, required: true },
    namespace: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    lastUsedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

ApiKeySchema.index({ userId: 1, isActive: 1 });

const ApiKey: Model<IApiKey> =
  models.ApiKey || model<IApiKey>("ApiKey", ApiKeySchema);

export default ApiKey;
