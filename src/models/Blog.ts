import { Schema, model } from "mongoose";

const blogSchema = new Schema<IBlog>({
	author: { type: Schema.Types.ObjectId, ref: "User", required: true },
	title: { type: String, required: true },
	content: { type: String, required: true },
}, { timestamps: true });

const Blog = model<IBlog>("Blog", blogSchema);

export default Blog;
