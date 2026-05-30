import { Document, Model, model, models, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  plan: "free" | "hobby" | "pro" | "growth" | "scale" | "enterprise";
  planUpdatedAt?: Date | null;
  resetToken?: string | null;
  resetExpires?: Date | null;
  savedQueries?: Array<{
    id: string;
    name: string;
    query: string;
    category?: string | null;
    tags: string[];
    topK: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SavedQuerySchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    query: { type: String, required: true, trim: true },
    category: { type: String, default: null },
    tags: { type: [String], default: [] },
    topK: { type: Number, default: 10 },
  },
  {
    _id: false,
    timestamps: true,
  }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    plan: {
      type: String,
      enum: ["free", "hobby", "pro", "growth", "scale", "enterprise"],
      default: "hobby",
    },
    planUpdatedAt: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetExpires: { type: Date, default: null },
    savedQueries: { type: [SavedQuerySchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
