import bcryptjs from "bcryptjs";
import { Request, Response } from "express";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import Interaction from "../models/Interaction.js";
// import { blogtypes } from "../../types/types.js";
const { compare } = bcryptjs;

import {
	buildResponse,
	generateSlug,
	getAnonymousUserId,
	getDeleteIds,
	getNextUniqueId
} from "../utils/blogUtils.js";

enum blogtypes {
	NORMAL_DRAFT = 1,
	ANON_POST,
	NORMAL_POST
}

const saveBlog = async (req: Request, res: Response): Promise<void> => {
	try {
		// take all parameters from extended request
		console.log(res.locals);
		let userId = res.locals.user.id;
		const { state, anon } = res.locals.validatedData;
		const { title, content, tags, category } = res.locals.validatedBody;
		const blogType = state === "draft" ?
			blogtypes.NORMAL_DRAFT : anon === "true" ?
				blogtypes.ANON_POST : blogtypes.NORMAL_POST;

		// some checks
		const restrictedTitle = "[Deleted Blog]";
		const restrictedContent = "This blog has been deleted"
		if (title === restrictedTitle || content === restrictedContent) {
			res.status(400).json({ message: "This title or content is restricted" });
			return;
		}
		if (state === "draft" && anon === "true") {
			res.status(400).json({ message: "Anonymous drafts are not allowed" });
			return;
		}
		// generate identifiers
		const uniqueId = await getNextUniqueId();
		if (uniqueId === -1) {
			res.status(400).json({ message: "Internal Server Error" });
			return;
		}
		const slug = generateSlug(title);

		// generate deletion id's if anonymous published post
		let anonBlogDeleteId: string = "none";
		let hashedAnonBlogDeleteId: string = "none";
		if (blogType === blogtypes.ANON_POST) {
			userId = getAnonymousUserId();
			[anonBlogDeleteId, hashedAnonBlogDeleteId] = await getDeleteIds();
		}

		// save the new blog
		const newBlog = await Blog.create({
			author: userId,
			state,
			uniqueId,
			slug,
			title,
			content,
			tags,
			category,
			anonBlogDeleteId: hashedAnonBlogDeleteId
		});
		// if (blogType !== blogtypes.NORMAL_DRAFT) {
		// 	await Interaction.create({
		// 		blogId: newBlog._id,
		// 		likes: [],
		// 		dislikes: [],
		// 		stars: []
		// 	});
		// }

		const response = buildResponse(blogType, anonBlogDeleteId);
		res.status(200).json(response);
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
	try {
		// take all parameters from req
		const userId = res.locals.user.id;
		const { state, blogId } = res.locals.validatedData;

		// check if blog exists to delete
		// check if user is author of blog
		const blog = await Blog.findOne({ _id: blogId });
		if (!blog) {
			res.status(404).json({ message: "This blog dosn't exist" });
			return;
		}
		if (!blog.author.equals(userId)) {
			res.status(403).json({ message: "You are not allowed to delete this blog" });
			return;
		}
		// delete the blog from database if it's a draft
		if (state === "draft") {
			await Blog.deleteOne({ _id: blogId });
		} else {
			await Blog.updateOne(
				{ _id: blogId },
				{
					$set: {
						title: "[Deleted Blog]",                    // change the title and content
						content: "This blog has been deleted by user",
						slug: "deleted-blog"
					}
				});
		}
		res.status(200).json({ message: `${state} blog deleted successfully` });
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

'/anonymous/:blogId?deleteId=lwncdln'

const deleteAnonBlog = async (req: Request, res: Response): Promise<void> => {
	try {
		const { anonBlogdeleteId, blogId } = res.locals.validatedData;
		const anonymous_user = getAnonymousUserId();
		const blog = await Blog.findOne({ _id: blogId });
		if (!blog) {
			res.status(404).json({ message: "This blog dosn't exist" });
			return;
		}
		if (!blog.author.equals(anonymous_user)) {
			res.status(403).json({ message: "You are not authorized to delete this blog" });
			return;
		}
		const isDeleteIdSame = await compare(anonBlogdeleteId, blog.anonBlogDeleteId);
		if (!isDeleteIdSame) {
			res.status(400).json({ message: "Invalid deleteId" });
			return;
		}
		await Blog.updateOne(
			{ _id: blogId },
			{
				$set: {
					title: "[Deleted Blog]",                    // change the title and content
					content: "This blog has been deleted by user",
					slug: "deleted-blog"
				}
			});
		res.status(200).json({ message: `Anonymous blog deleted successfully` });
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const publishDraft = async (req: Request, res: Response): Promise<void> => {
	try {
		// check for anonymous user id's existence in .env
		const anonymous_user = getAnonymousUserId();
		const userId = res.locals.user.id;
		const { anon, blogId } = res.locals.validatedData;

		// check if draft blog exists to publish
		// check if user is author of blog
		const blog = await Blog.findOne({ _id: blogId });
		if (!blog) {
			res.status(404).json({ message: "This blog dosn't exist" });
			return;
		}
		if (!blog.author.equals(userId)) {
			res.status(403).json({ message: "You are not allowed to publish this blog" });
			return;
		}
		// if blog is to be published anonymously set the userId to global anonymous id
		if (anon === "true") blog.author = anonymous_user
		// change the blog state to published
		blog.state = "published"
		await blog.save();

		// create empty interactions and comments collection
		// await Interaction.create({
		// 	blogId: blog._id,
		// 	likes: [],
		// 	dislikes: [],
		// 	stars: []
		// });

		// send appropriate response message
		if (anon === "true") res.status(200).json({ message: "Draft published anonymously" });
		else res.status(200).json({ message: "Draft published" });
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const updateBlog = async (req: Request, res: Response): Promise<void> => {
	try {
		let userId = res.locals.user.id;
		const { state, blogId } = res.locals.validatedData;
		const { title, content, tags, category } = res.locals.validatedBody;

		// check if draft blog exists to publish
		// check if user is author of blog
		const blog = await Blog.findOne({ _id: blogId });
		if (!blog) {
			res.status(404).json({ message: "This blog dosn't exist" });
			return;
		}
		if (!blog.author.equals(userId)) {
			res.status(403).json({ message: "You are not allowed to update this blog" });
			return;
		}
		// check if title update is forbidden or not
		const restrictedTitle = "[Deleted Blog]";
		const restrictedContent = "This blog has been deleted"
		if (title === restrictedTitle || content === restrictedContent) {
			res.status(400).json({ message: "This title or content is restricted" });
			return;
		}

		// update the blog
		blog.title = title;
		blog.content = content;
		if (tags) blog.tags = tags;
		blog.category = category;

		await blog.save();
		res.status(200).json({ message: `${state} blog updated successfully` });
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const getBlogsWithSearch = async (req: Request, res: Response): Promise<void> => {
	try {
		// take parameters from req
		const search = req.query.search ? String(req.query.search) : false;
		const userId = res.locals.user.id;
		const state = res.locals.validatedData.state;

		// build the query accordingly if search exists or not 
		const query = search ?
			{
				author: userId,
				state,
				$or: [
					{ title: { $regex: search, $options: "i" } }, // Case-insensitive search in title
					{ content: { $regex: search, $options: "i" } }, // Case-insensitive search in content
					{ tags: { $regex: search, $optiond: "i" } }
				]
			}
			: { author: userId, state };

		// execute the query
		const blogs = await Blog.find(query).select("-__v -anonBlogDeleteId").populate([
			{ path: "author", select: "name" },
			{ path: "category", select: "name" },
		]);
		res.status(200).json(blogs);
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const getBlogById = async (req: Request, res: Response): Promise<void> => {
	try {
		// take all parameters from req
		const userId = res.locals.user.id;
		const { blogId, state } = res.locals.validatedData;

		// here get the blogs by the user only
		const blog = await Blog.findOne({ author: userId, _id: blogId, state }).select("-__v -anonBlogDeleteId").populate([
			{ path: "author", select: "name" },
			{ path: "category", select: "name" },
		]);
		const parentComments = await Comment.find({
			blogId,
			parentId: blogId  // treating blogId as parentId for top-level comments
		})
		.select("-__v")
		.populate("userId", "name");
		res.status(200).json({ blog, parentComments });
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

export {
	deleteAnonBlog, deleteBlog, getBlogById, getBlogsWithSearch, publishDraft, saveBlog, updateBlog
};

