import { Schema , model , Document, Types } from "mongoose";

interface IComment extends Document{
    blogId: Types.ObjectId
	content: string,
	userId: Types.ObjectId,
	parentId: Types.ObjectId,
	likes: Types.ObjectId[]
}

const commentSchema = new Schema<IComment>({
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
	content: { type: String, trim: true, required: true },
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
	likes: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

const Comment = model<IComment>("Comment", commentSchema);

export default Comment;