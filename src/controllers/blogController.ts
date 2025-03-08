import { Request, Response } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import Blog from "../models/Blog.js";

const blogSchema = z.object({
    title: z.string(),
    content: z.string(),
    state: z.string()
})

const addBlog = async (req: Request, res: Response): Promise<void> => {
	const userId:Types.ObjectId  = req.user.id;
    const parsedBody = blogSchema.safeParse(req.body);
    if (!parsedBody.success) {
        res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
        return;
    }
    const { title , content , state } =  parsedBody.data;

	try {
		const newBlog = new Blog({
			author: userId,
            state,
			title,
			content
		});

		await newBlog.save();

		res.status(200).json({
			message: "Your blog is uploaded !!!"
		});
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
	const userId: Types.ObjectId = req.user.id;
	const blogId: string = req.params.id;

	try {
		const blog = await Blog.findById(blogId);
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
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const updateBlog = async (req: Request, res: Response): Promise<void> => {
	const userId: Types.ObjectId = req.user.id;
	const blogId: string = req.params.id;
    const parsedBody = blogSchema.safeParse(req.body);
    if (!parsedBody.success) {
        res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
        return;
    }
    const { title , content , state } =  parsedBody.data;

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

		blog.title = title;
		blog.content = content;
        blog.state = state;

		await blog.save();

		res.status(200).json({ message: "Blog updated successfully", blog });
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
};

const getBlogs = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: Types.ObjectId = req.user.id;
		const blogs = await Blog.find({ author: userId , state: "published" });
		res.status(200).json(blogs);
	} catch (err) {
		console.error("❌ Some error occurred:", err instanceof Error ? err.message : err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const getDrafts = async (req: Request, res: Response): Promise<void> => {
    try{
        const userId: Types.ObjectId = req.user.id;
		const blogs = await Blog.find({ author: userId , state: "draft" });
		res.status(200).json(blogs);
    } catch (err) {
		console.error("❌ Some error occurred:", err instanceof Error ? err.message : err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

export {
	addBlog,
	deleteBlog,
	updateBlog,
	getBlogs,
    getDrafts
}