import { Request, Response } from "express"
import Blog from "../models/Blog.js"

const getBlogById = async (req: Request, res: Response): Promise<void> => {
	try {
		const blogId: string = req.params.id;
		const blog = await Blog.findById(blogId);
		res.status(200).json(blog);
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const getBlogsWithSearch = async (req: Request, res: Response): Promise<void> => {
	try {
		const search = String(req.query.search) || null;

		// Sanitize search input to prevent regex injection
		const escapeRegex = (string: string) => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		const sanitizedSearch = search ? escapeRegex(search) : null;

		// Build the search query only if there's a valid search term
		const query = sanitizedSearch ?
			{
				$or: [
					{ title: { $regex: sanitizedSearch, $options: 'i' } },
					{ content: { $regex: sanitizedSearch, $options: 'i' } }
				]
			}
			: {};

		const blogs = await Blog.find(query);
		res.status(200).json(blogs);
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