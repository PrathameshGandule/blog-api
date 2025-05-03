import { Schema, model } from "mongoose";
import { Types, Document } from "mongoose";

interface IBlog extends Document {
    author: Types.ObjectId,
    state: "published" | "draft",
    uniqueId: number,
    slug: string,
    title: string,
    content: string,
    tags: string[],
    category: Types.ObjectId,
	likesCount: Number,
	dislikesCount: Number,
	starsCount: Number,
    anonBlogDeleteId: string
}

const blogSchema = new Schema<IBlog>({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    state: { type: String, enum: ["published", "draft"], required: true },
    uniqueId: { type: Number, required: true, unique: true },
    slug: { type: String, required: true, trim: true },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true, _id: false }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
	likesCount: { type: Number, default: 0 },
	dislikesCount: { type: Number, default: 0 },
	starsCount: { type: Number, default: 0 },
    anonBlogDeleteId: { type: String }
}, { timestamps: true });

const Blog = model<IBlog>("Blog", blogSchema);

export type { IBlog };
export default Blog;
