import { Request, Response } from "express";
import Blog from "../models/Blog.js";
import { DeleteResult, Types } from "mongoose";

const addBlog = async (req: Request, res: Response): Promise<void> => {
	const userId: Types.ObjectId = req.user.id;

	if (!req.body.title || !req.body.content) {
		res.status(404).json({ message: "PLease provide title and content both !" });
		return;
	}
	const title: string = req.body.title;
	const content: string = req.body.content;

	try {
		const newBlog: IBlog = new Blog({
			author: userId,
			title,
			content
		});

		await newBlog.save();

		res.status(200).json({
			message: "Your blog is uploaded !!!"
		});
	} catch (err: unknown) {
		console.error("❌ Some error occurred:", err instanceof Error ? err.message : err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
	const userId: Types.ObjectId = req.user.id;
	const blogId: string = req.params.id;

	try {
		const blog: IBlog | null = await Blog.findById(blogId);
		if (!blog) {
			res.status(404).json({ message: "Blog not found" });
			return;
		}

		if (!blog.author.equals(userId)) {
			res.status(403).json({ message: "You are not authorized to delete this blog" });
			return;
		}

		await Blog.deleteOne({ _id: blog._id });

		res.status(200).json({ message: "Your blog is deleted" });
	} catch (err: unknown) {
		console.error("❌ Some error occurred:", err instanceof Error ? err.message : err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const updateBlog = async (req: Request, res: Response): Promise<void> => {
	const userId: Types.ObjectId = req.user.id;
	const blogId: string = req.params.id;
	const { title, content } = req.body;

	try {
		const blog = await Blog.findById(blogId);
		if (!blog) {
			res.status(404).json({ message: "Blog not found" });
			return;
		}

		if (!blog.author.equals(userId)) {
			res.status(403).json({ message: "You are not authorized to update this blog" });
			return;
		}

		if (!title && !content) {
			res.status(400).json({ message: "Please provide at least one field to update" });
			return;
		}

		if (title) blog.title = title;
		if (content) blog.content = content;

		await blog.save();

		res.status(200).json({ message: "Blog updated successfully", blog });
	} catch (err: unknown) {
		console.error("❌ Some error occurred:", err instanceof Error ? err.message : err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
};

const getBlogs = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: Types.ObjectId = req.user.id;
		const blogs: IBlog[] = await Blog.find({ author: userId });
		res.status(200).json(blogs);
	} catch (err: unknown) {
		console.error("❌ Some error occurred:", err instanceof Error ? err.message : err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

export {
	addBlog,
	deleteBlog,
	updateBlog,
	getBlogs
}