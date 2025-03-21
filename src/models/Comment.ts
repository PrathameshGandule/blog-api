import { Schema , model , Document, Types } from "mongoose";

interface IComment extends Document{
    blogId: Types.ObjectId
    comments: {
        content: string,
        userId: Types.ObjectId,
        likes: Types.ObjectId[]
    }[]
}

const commentSchema = new Schema<IComment>({
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true, unique: true },
    comments: [{
        content: { type: String, trim: true, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        likes: [{ type: Schema.Types.ObjectId, ref: "User", unique: true }]
    }]
}, { timestamps: true });

const Comment = model<IComment>("Comment", commentSchema);

export default Comment;