import { Request, Response } from "express"
import Blog from "../models/Blog.js"
import { Types } from "mongoose";
import Comment from "../models/Comment.js";

const getBlogById = async (req: Request, res: Response): Promise<void> => {
	try {
		// take parameters from req
		const blogId = new Types.ObjectId(req.params.id);

		// find the blog and populate by author id
		const blog = await Blog.findOne({
			_id: blogId,
			state: "published"
		}).select("-__v -anonBlogDeleteId -updatedAt").populate([
			{ path: "author", select: "name" },
			{ path: "category", select: "name" },
		]);
		const parentComments = await Comment.find({
			blogId,
			parentId: blogId  // treating blogId as parentId for top-level comments
		})
			.select("content likes userId createdAt blogId")
			.populate("userId", "name");
		res.status(200).json({ blog, parentComments });
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const getBlogsWithSearch = async (req: Request, res: Response): Promise<void> => {
	try {
		const search = req.query.search ? String(req.query.search) : false;

		// build the query according to search
		const query = search ?
			{
				state: "published",
				$or: [
					{ title: { $regex: search, $options: "i" } }, // Case-insensitive search in title
					{ content: { $regex: search, $options: "i" } }, // Case-insensitive search in content
				]
			}
			: { state: "published" };

		// populate by author Id
		const blogs = await Blog.find(query).select("-__v -anonBlogDeleteId").populate([
			{ path: "author", select: "name" },
			{ path: "category", select: "name" },
		]);

		res.status(200).json({ length: blogs.length, blogs });
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

export {
	getBlogById,
	getBlogsWithSearch
}