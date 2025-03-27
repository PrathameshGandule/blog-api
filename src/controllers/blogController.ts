import { Request, Response } from "express";
import { Types } from "mongoose";
import Blog from "../models/Blog.js";
import bcryptjs from "bcryptjs";
const { compare } = bcryptjs;
import { blogtypes } from "../@types/types.js";

import {
	BodyRestrictedError,
	AnonymousDraftError,
	BlogDoesntExistError,
	NotBlogAuthorError,
	getNextUniqueId,
	restrictedBodyCheck,
	anonymousDraftCheck,
	blogExistAndAuthorCheck,
	getAnonymousUserId,
	getDeleteIds,
	generateSlug,
	buildResponse
} from "../utils/blogUtils.js";

const saveBlog = async (req: Request, res: Response): Promise<void> => {
	try {
		// take all parameters from extended request
		let userId = req.user.id;
		const { state, anon } = req.validatedData;
		const { title, content, tags, category } = req.validatedBody;
		const blogType = state === "draft" ? blogtypes.NORMAL_DRAFT : anon === "true" ? blogtypes.ANON_POST : blogtypes.NORMAL_POST;

		// some checks
		restrictedBodyCheck(title, content);
		anonymousDraftCheck(state, anon);

		// generate identifiers
		const uniqueId = await getNextUniqueId();
		const slug = generateSlug(title);

		// generate deletion id's if anonymous published post
		let anonBlogDeleteId: string = "none";
		let hashedAnonBlogDeleteId: string = "none";
		if (blogType === blogtypes.ANON_POST) {
			userId = getAnonymousUserId();
			[anonBlogDeleteId, hashedAnonBlogDeleteId] = await getDeleteIds();
		}

		// save the new blog
		const newBlog = new Blog({
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
		await newBlog.save();

		const response = buildResponse(blogType, anonBlogDeleteId);
		res.status(200).json(response);
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		if (err instanceof BodyRestrictedError || err instanceof AnonymousDraftError) {
			res.status(400).json({ message: err.message });
			return;
		}
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
	try {
		// take all parameters from req
		const userId = req.user.id;
		const { state, blogId } = req.validatedData;

		// check if blog exists to delete
		// check if user is author of blog
		await blogExistAndAuthorCheck(blogId, userId);

		// delete the blog from database if it's a draft
		if (state === "draft") {
			await Blog.deleteOne({ _id: blogId });
		} else {
			await Blog.updateOne(
				{ _id: blogId },
				{
					$set: {
						title: "[Deleted Blog]",                    // change the title and content
						content: "This blog has been deleted"
					}
				});
		}
		res.status(200).json({ message: `${state} blog deleted successfully` });
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		if (err instanceof BlogDoesntExistError || err instanceof NotBlogAuthorError) {
			res.status(400).json({ message: err.message });
			return;
		}
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

'/anonymous/:blogId?deleteId=lwncdln'

const deleteAnonBlog = async (req: Request, res: Response): Promise<void> => {
	try {
		const { anonBlogdeleteId, blogId } = req.validatedData;
		const anonymous_user = getAnonymousUserId();
		const blog = await blogExistAndAuthorCheck(blogId, anonymous_user);
		const isDeleteIdSame = await compare(anonBlogdeleteId, blog.anonBlogDeleteId);
		if (!isDeleteIdSame) {
			res.json(400).json({ message: "Invalid deleteId" });
			return;
		}
		await Blog.updateOne(
			{ _id: blogId },
			{
				$set: {
					title: "[Deleted Blog]",                    // change the title and content
					content: "This blog has been deleted"
				}
			});
		res.status(200).json({ message: `Anonymous blog deleted successfully` });
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		if (err instanceof BlogDoesntExistError || err instanceof NotBlogAuthorError) {
			res.status(400).json({ message: err.message });
			return;
		}
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const publishDraft = async (req: Request, res: Response): Promise<void> => {
	try {
		// check for anonymous user id's existence in .env
		const anonymous_user = getAnonymousUserId();
		const userId = req.user.id;
		const { anon, blogId } = req.validatedData;

		// check if draft blog exists to publish
		// check if user is author of blog
		const blog = await blogExistAndAuthorCheck(blogId, userId);

		// if blog is to be published anonymously set the userId to global anonymous id
		if (anon === "true") blog.author = anonymous_user
		// change the blog state to published
		blog.state = "published"
		await blog.save();

		// send appropriate response message
		if (anon === "true") res.status(200).json({ message: "Draft published anonymously" });
		else res.status(200).json({ message: "Draft published" });
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		if (err instanceof BlogDoesntExistError || err instanceof NotBlogAuthorError) {
			res.status(400).json({ message: err.message });
			return;
		}
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const updateBlog = async (req: Request, res: Response): Promise<void> => {
	try {
		let userId = req.user.id;
		const { state, blogId } = req.validatedData;
		const { title, content, tags, category } = req.validatedBody;

		// check if draft blog exists to publish
		// check if user is author of blog
		const blog = await blogExistAndAuthorCheck(blogId, userId);

		// check if title update is forbidden or not
		restrictedBodyCheck(title, content);

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
		if (err instanceof BlogDoesntExistError
			|| err instanceof NotBlogAuthorError
			|| err instanceof BodyRestrictedError) {
			res.status(400).json({ message: err.message });
			return;
		}
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const getBlogsWithSearch = async (req: Request, res: Response): Promise<void> => {
	try {
		// take parameters from req
		const search = req.body.search ? String(req.body.search) : false;
		const userId = req.user.id;
		const state = req.validatedData.state;

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
		const blogs = await Blog.find(query).select("-__v -anonBlogDeleteId").populate("category");
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
		const userId = req.user.id;
		const { blogId, state } = req.validatedData;

		// here get the blogs by the user only
		const blog = await Blog.findOne({ author: userId, _id: blogId, state }).select("-__v -anonBlogDeleteId");
		res.status(200).json(blog)
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

export {
	saveBlog,
	deleteBlog,
	updateBlog,
	getBlogsWithSearch,
	getBlogById,
	publishDraft
}

