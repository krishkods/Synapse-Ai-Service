import { Document, Model, Schema, model, models } from "mongoose";

export interface IUsageCounter extends Document {
  ownerId: string;
  apiKeyId?: string | null;
  plan: string;
  metric: "requests" | "add_requests" | "retrieval_requests" | "active_memories";
  window: "minute" | "day" | "month" | "lifetime";
  windowKey: string;
  namespace?: string | null;
  count: number;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UsageCounterSchema = new Schema<IUsageCounter>(
  {
    ownerId: { type: String, required: true, index: true },
    apiKeyId: { type: String, default: null, index: true },
    plan: { type: String, required: true },
    metric: {
      type: String,
      enum: ["requests", "add_requests", "retrieval_requests", "active_memories"],
      required: true,
    },
    window: {
      type: String,
      enum: ["minute", "day", "month", "lifetime"],
      required: true,
    },
    windowKey: { type: String, required: true },
    namespace: { type: String, default: null },
    count: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
  }
);

UsageCounterSchema.index(
  { ownerId: 1, metric: 1, window: 1, windowKey: 1, namespace: 1 },
  { unique: true }
);

UsageCounterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UsageCounter: Model<IUsageCounter> =
  models.UsageCounter ||
  model<IUsageCounter>("UsageCounter", UsageCounterSchema);

export default UsageCounter;
