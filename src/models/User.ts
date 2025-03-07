import { Schema, model, Document, Types, Date } from "mongoose";

interface IUser extends Document {
    // _id: Types.ObjectId,
    name: string,
    password: string,
    email: string,
    // __v: number,
    // createdAt: Date,
    // updatedAt: Date
}

const userSchema = new Schema<IUser>({
	name: { type: String, required: true },
	password: { type: String, required: true },
	email: { type: String, required: true, unique: true }
}, { timestamps: true });

const User = model<IUser>("User", userSchema);

export type { IUser };
export default User;
