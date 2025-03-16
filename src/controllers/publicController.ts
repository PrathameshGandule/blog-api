import { Request, Response } from "express"
import Blog from "../models/Blog.js"
import { Types } from "mongoose";

const getBlogById = async (req: Request, res: Response): Promise<void> => {
	try {
		const blogId = new Types.ObjectId(req.params.id);
		const blog = await Blog.findOne({
            _id: blogId,
            state: "published"
        }).select("-__v -updatedAt").populate("author", "name").exec();
		res.status(200).json({ success: true, blog });
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ success: false, message: "Internal Server Error" });
		return;
	}
}

const getBlogsWithSearch = async (req: Request, res: Response): Promise<void> => {
	try {
		const search = req.body.search ? String(req.body.search) : false;

		const query = search ?
			{
				state: "published",
                $or: [
                    { title: { $regex: search, $options: "i" } }, // Case-insensitive search in title
                    { content: { $regex: search, $options: "i" } }, // Case-insensitive search in content
                ]
			}
			: { state: "published" };

		const blogs = await Blog.find(query).select("-__v -updatedAt").populate("author", "name").exec();
		res.status(200).json({ success: true, length: blogs.length, blogs });
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ success: false, message: "Internal Server Error" });
		return;
	}
}

export {
	getBlogById,
	getBlogsWithSearch
}