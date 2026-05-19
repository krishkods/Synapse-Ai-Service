import mongoose, { Document, Model, model, models, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  resetToken?: string | null;
  resetExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    resetToken: { type: String, default: null },
    resetExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
