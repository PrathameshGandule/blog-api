import { Request, Response } from "express";
import { Types } from "mongoose";
import { z, ZodError } from "zod";
import Blog, { IBlog } from "../models/Blog.js";

const blogSchema = z.object({
    title: z.string(),
    content: z.string()
});
const stateSchema = z.enum(["draft", "published"])
const objectIdSchema = z.custom<Types.ObjectId>(
    (id) => Types.ObjectId.isValid(id),
    { message: "Invalid ObjectId" }
);

const saveBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        let userId: Types.ObjectId = req.user.id;
        let state = req.params.state;
        let anon = req.query.anon ? String(req.query.anon) : "false";
        const parsedBody = blogSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { title, content } = parsedBody.data;
        if (!process.env.ANONYMOUS_USER_ID) {
            throw new Error("NO ANONYMOUS_USER_ID provided in .env file!!!")
        };
        const anonymous_user = new Types.ObjectId(process.env.ANONYMOUS_USER_ID);
        if (state === "draft" && anon === "true") {
            res.status(400).json({ success: false, message: "Not allowed" });
            return;
        }
        let draft: IBlog
        if (state === "published" && anon === "true") {
            userId = anonymous_user
        }
        draft = new Blog({
            author: userId,
            state,
            title,
            content,
        });
        await draft.save();
        res.status(200).json({
            success: true,
            message: "Your draft is saved"
        });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
    }
}

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId: Types.ObjectId = req.user.id;
        const blogId = new Types.ObjectId(req.params.id);
        const state = req.params.state;
        const blog = await Blog.findOne({ _id: blogId, state });
        if (!blog) {
            res.status(404).json({
                success: false,
                message: "Blog not found"
            });
            return;
        }

        if (!blog.author.equals(userId)) {
            res.status(403).json({
                success: false,
                message: "You are not authorized to delete this blog"
            });
            return;
        }
        if (state === "draft") {
            await Blog.findByIdAndDelete(blogId);
        } else {
            await Blog.findByIdAndUpdate(blogId, {
                $set: {
                    title: "[Deleted Blog]",
                    content: "This blog has been deleted"
                }
            });
        }
        res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
    }
}

const publishDraft = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!process.env.ANONYMOUS_USER_ID) {
            throw new Error("NO ANONYMOUS_USER_ID provided in .env file!!!")
        };
        const anonymous_user = new Types.ObjectId(process.env.ANONYMOUS_USER_ID);
        const anon = req.query.anon ? String(req.query.anon) : "false";
        const userId: Types.ObjectId = req.user.id;
        const draftId = new Types.ObjectId(req.params.id);
        const draft = await Blog.findOne({ _id: draftId, state: "draft" });
        if (!draft) {
            res.status(404).json({
                success: false,
                message: "Draft not found"
            });
            return;
        }
        if (!draft.author.equals(userId)) {
            res.status(403).json({
                success: false,
                message: "You are not authorized to publish this blog"
            });
            return;
        }
        if (anon === "true") draft.author = anonymous_user
        draft.state = "published"
        await draft.save();
        if (anon === "true") res.status(200).json({ success: true, message: "Draft published anonymously" });
        else res.status(200).json({ success: true, message: "Draft published successfully" });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
    }
}

const updateBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedBody = blogSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { title, content } = parsedBody.data;
        const userId: Types.ObjectId = req.user.id;
        const state: string = req.params.state;
        const blogId = new Types.ObjectId(req.params.id);
        const blog = await Blog.findOne({ _id: blogId, state });
        if (!blog) {
            res.status(404).json({
                success: false,
                message: "Draft not found"
            });
            return;
        }
        if (!blog.author.equals(userId)) {
            res.status(403).json({
                success: false,
                message: "You are not authorized to delete this blog"
            });
            return;
        }
        blog.title = title;
        blog.content = content;
        await blog.save();
        res.status(200).json({ success: true, message: "Blog updated successfully" });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
    }
}

const getBlogsWithSearch = async (req: Request, res: Response): Promise<void> => {
    try {
        const search = req.body.search ? String(req.body.search) : false;
        const userId: Types.ObjectId = req.user.id;
        const state = req.params.state;
        const query = search ?
            {
                author: userId,
                state,
                $or: [
                    { title: { $regex: search, $options: "i" } }, // Case-insensitive search in title
                    { content: { $regex: search, $options: "i" } }, // Case-insensitive search in content
                ]
            }
            : { author: userId, state };

        const blogs = await Blog.find(query);
        res.status(200).json({ success: true, blogs });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
    }
}

const getBlogById = async (req: Request, res: Response): Promise<void> => {
    try {
        const blogId = new Types.ObjectId(req.params.id);
        const state = req.params.state;
        const blog = await Blog.findOne({ _id: blogId, state });
        res.status(200).json({ success: true, blog })
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
    }
}

// const addBlog = async (req: Request, res: Response): Promise<void> => {
// 	let userId:Types.ObjectId = req.user.id;
//     const parsedBody = blogSchema.safeParse(req.body);
//     if (!parsedBody.success) {
//         res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
//         return;
//     }
// const { title , content , state , type } =  parsedBody.data;
// 	try {
//         let newBlog: IBlog
//         if(type === "anon"){
//             newBlog = new Blog({
//                 state,
//                 title,
//                 content
//             });
//         } else {
//             newBlog = new Blog({
//                 author: userId,
//                 state,
//                 title,
//                 content
//             });
//         }

// 		await newBlog.save();

// 		res.status(200).json({
// 			message: "Your blog is uploaded !!!"
// 		});
// } catch (err) {
// 	console.error("❌ Some error occurred:", err);
// 	res.status(500).json({ message: "Internal Server Error" });
// 	return;
// }
// }

// const deleteBlog = async (req: Request, res: Response): Promise<void> => {
// 	const userId: Types.ObjectId = req.user.id;
// 	const blogId: string = req.params.id;

// 	try {
// 		const blog = await Blog.findById(blogId);
// 		if (!blog) {
// 			res.status(404).json({ message: "Blog not found" });
// 			return;
// 		}

// 		if (!blog.author.equals(userId)) {
// 			res.status(403).json({ message: "You are not authorized to delete this blog" });
// 			return;
// 		}

// 		await Blog.findByIdAndUpdate(blogId,
//         {
//             $set: { state: "deleted" }
//         }
//         );

// 		res.status(200).json({ message: "Your blog is deleted" });
// 	} catch (err) {
// 		console.error("❌ Some error occurred:", err);
// 		res.status(500).json({ message: "Internal Server Error" });
// 		return;
// 	}
// }

// const updateBlog = async (req: Request, res: Response): Promise<void> => {
// 	const userId: Types.ObjectId = req.user.id;
// 	const blogId: string = req.params.id;
//     const parsedBody = blogSchema.safeParse(req.body);
//     if (!parsedBody.success) {
//         res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
//         return;
//     }
//     const { title , content , state } =  parsedBody.data;

// 	try {
// 		const blog = await Blog.findById(blogId);
// 		if (!blog) {
// 			res.status(404).json({ message: "Blog not found" });
// 			return;
// 		}

// 		if (!blog.author.equals(userId)) {
// 			res.status(403).json({ message: "You are not authorized to update this blog" });
// 			return;
// 		}

// 		blog.title = title;
// 		blog.content = content;
//         blog.state = state;

// 		await blog.save();

// 		res.status(200).json({ message: "Blog updated successfully", blog });
// 	} catch (err) {
// 		console.error("❌ Some error occurred:", err);
// 		res.status(500).json({ message: "Internal Server Error" });
// 		return;
// 	}
// };

// const getBlogs = async (req: Request, res: Response): Promise<void> => {
// 	try {
// 		const userId: Types.ObjectId = req.user.id;
// 		const blogs = await Blog.find({ author: userId , state: "published" }).select("-__v -updatedAt").populate("author", "name").exec();
// 		res.status(200).json(blogs);
// 	} catch (err) {
// 		console.error("❌ Some error occurred:", err instanceof Error ? err.message : err);
// 		res.status(500).json({ message: "Internal Server Error" });
// 		return;
// 	}
// }

// const getDrafts = async (req: Request, res: Response): Promise<void> => {
//     try{
//         const userId: Types.ObjectId = req.user.id;
// 		const blogs = await Blog.find({ author: userId , state: "draft" });
// 		res.status(200).json(blogs);
//     } catch (err) {
// 		console.error("❌ Some error occurred:", err instanceof Error ? err.message : err);
// 		res.status(500).json({ message: "Internal Server Error" });
// 		return;
// 	}
// }

export {
    saveBlog,
    deleteBlog,
    updateBlog,
    getBlogsWithSearch,
    getBlogById,
    publishDraft
}

