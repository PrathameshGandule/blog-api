import { Schema, model, Document, Types } from "mongoose";

interface IUser extends Document {
    name: string,
    password: string,
    email: string,
    bio?: string,
    savedPosts: Types.ObjectId[],
    following: Types.ObjectId[]
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    bio: { type: String, trim: true,  },
    savedPosts: [{ type: Schema.Types.ObjectId, ref: "Blog", _id: false }],
    following: [{ type: Schema.Types.ObjectId, ref: "User", _id: false }]	
}, { timestamps: true });

const User = model<IUser>("User", userSchema);

export type { IUser };
export default User;

