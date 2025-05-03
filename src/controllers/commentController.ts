import { Request , Response } from "express";
import Comment from "../models/Comment.js";
import { z } from "zod";
import { Types } from "mongoose";

const commentSchema = z.object({
	content: z.string().nonempty(),
	parentId: z.custom<Types.ObjectId>(
		(val) => Types.ObjectId.isValid(val),
		{ message: "Invalid ObjectId" }
	)
});

const updateSchema = z.object({
	content: z.string().nonempty()
});

const addComment = async(req: Request, res: Response): Promise<void> => {
	try{
		const parsedBody = commentSchema.safeParse(req.body);
		if (!parsedBody.success) {
			res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
			return;
		}
		const { content , parentId } = parsedBody.data;
		const blogId = res.locals.validatedData.blogId;
		const userId = res.locals.user.id;
		await Comment.create({
			blogId,
			content,
			parentId,
			userId,
			likes: []
		});
		res.status(200).json({ message: "Comment added successfully" });
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const deleteComment = async (req: Request, res: Response): Promise<void> => {
	try {
		const commentId = res.locals.validatedData.commentId;
		const userId = res.locals.user.id;
		await Comment.findOneAndUpdate({
			_id: commentId,
			userId
		}, {
			$set: {
				content: "[Comment deleted by user]"
			}
		});
		res.status(204).send();
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const updateComment = async (req: Request, res: Response): Promise<void> => {
	try {
		const commentId = res.locals.validatedData.commentId;
		const userId = res.locals.user.id;
		const parsedBody = updateSchema.safeParse(req.body);
		if (!parsedBody.success) {
			res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
			return;
		}
		const { content } = parsedBody.data;
		await Comment.findOneAndUpdate({
			_id: commentId,
			userId
		}, {
			$set: {
				content
			}
		});
		res.status(204).send();
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const getAllParentComments = async (req: Request, res: Response): Promise<void> => {
	try {
		const blogId = res.locals.validatedData.blogId;
		const comments = await Comment.find({ blogId, parentId: blogId }).select("-__v -updatedAt");
		res.status(200).json(comments);
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const getAllReplyComments = async (req: Request, res: Response): Promise<void> => {
	try {
		const commentId = res.locals.validatedData.commentId;
		const comments = await Comment.find({ parentId: commentId }).select("-__v -updatedAt");
		res.status(200).json(comments);
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const toggleLikeComment = async (req: Request, res: Response): Promise<void> => {
	try {
		const commentId = res.locals.validatedData.commentId;
		const userId = res.locals.user.id;

		const comment = await Comment.findById(commentId);
		if (!comment) {
			res.status(404).json({ message: "Comment not found" });
			return;
		}
		const hasLiked = comment.likes.some((id) => id.equals(userId));

		if (hasLiked) {
			// Unlike
			comment.likes = comment.likes.filter((id) => !id.equals(userId));
			await comment.save();
			res.status(200).json({ message: "Like removed" });
		} else {
			// Like
			comment.likes.push(userId);
			await comment.save();
			res.status(201).json({ message: "Comment liked" });
		}

	} catch (err) {
		console.error("❌ Error toggling like on comment:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
};


export {
	addComment,
	deleteComment,
	updateComment,
	getAllParentComments,
	getAllReplyComments,
	toggleLikeComment
}