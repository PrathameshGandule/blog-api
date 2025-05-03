import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { Types } from "mongoose";
import slugify from "slugify";
import Blog, { IBlog } from "../models/Blog.js";
import Counter from "../models/Counter.js";
// import { blogtypes } from "../types/types.js";


enum blogtypes {
	NORMAL_DRAFT = 1,
	ANON_POST,
	NORMAL_POST
}

export class BodyRestrictedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BodyRestrictedError";
		Object.setPrototypeOf(this, BodyRestrictedError.prototype);
	}
}

export class AnonymousDraftError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AnonymousDraftError";
		Object.setPrototypeOf(this, AnonymousDraftError.prototype);
	}
}

export class BlogDoesntExistError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BlogDoesntExistError";
		Object.setPrototypeOf(this, BlogDoesntExistError.prototype);
	}
}

export class NotBlogAuthorError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NotBlogAuthorError";
		Object.setPrototypeOf(this, NotBlogAuthorError.prototype);
	}
}

export const getNextUniqueId = async (): Promise<Number> => {
	try {
		const counter = await Counter.findOneAndUpdate(
			{ name: "Blog" },
			{ $inc: { count: 1 } },
			{ new: true, upsert: true, projection: { count: 1 } }
		);
		return counter.count;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		return -1;
	}
}

export const generateSlug = (myString: string): string => {
	const slugedString = slugify(myString, { lower: true, strict: true, trim: true });
	return slugedString;
}

export const restrictedBodyCheck = (title: string, content: string): void => {
	const restrictedTitle = "[Deleted Blog]";
	const restrictedContent = "This blog has been deleted"
	if (title === restrictedTitle || content === restrictedContent) {
		throw new BodyRestrictedError("This title or content is restricted");
	}
}

export const getAnonymousUserId = (): Types.ObjectId => {
	if (!process.env.ANONYMOUS_USER_ID) {
		throw new Error("No ANONYMOUS_USER_ID provided in .env file!!!")
	};
	return new Types.ObjectId(process.env.ANONYMOUS_USER_ID);
}

export const anonymousDraftCheck = (state: "draft" | "published", anon: "true" | "false"): void => {
	if (state === "draft" && anon === "true") {
		throw new AnonymousDraftError("Anonymous drafts are not allowed");
	}
}

export const getDeleteIds = async (): Promise<[string, string]> => {
	const anonBlogDeleteId = crypto.randomUUID();
	const hashedAnonBlogDeleteId = await bcryptjs.hash(anonBlogDeleteId, 10);
	return [anonBlogDeleteId, hashedAnonBlogDeleteId];
}

export const buildResponse = (blogType: blogtypes, anonBlogDeleteId: string | null) => {
	let message = blogType === blogtypes.NORMAL_DRAFT ? "Your draft is saved"
		: blogType === blogtypes.NORMAL_POST ? "Your post is published"
			: "Your post is published anonymously and use following special id if you want to delete this post";
	let response = blogType === blogtypes.ANON_POST ? { message, deleteId: anonBlogDeleteId } : { message };
	return response;
}

export const blogExistAndAuthorCheck = async (blogId: Types.ObjectId, userId: Types.ObjectId): Promise<IBlog> => {
	const blog = await Blog.findOne({ _id: blogId });
	if (!blog) {
		throw new BlogDoesntExistError("This blog dosn't exist");
	}
	if (!blog.author.equals(userId)) {
		throw new NotBlogAuthorError("You are not authorized to operate on this blog");
	}
	return blog;
}