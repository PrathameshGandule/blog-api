import { Schema, model, Document, Types } from "mongoose";

const userSchema = new Schema<IUser>({
	name: { type: String, required: true },
	password: { type: String, required: true },
	email: { type: String, required: true }
}, { timestamps: true });

const User = model<IUser>("User", userSchema);

export default User;
