import { Request, Response } from "express";
import Interaction from "../models/Interaction";
import Blog from "../models/Blog";

const toggleInteraction = async (req: Request, res: Response): Promise<void> => {
	try {
		const blogId = res.locals.validatedData.blogId;
		const { type } = req.body;
		const userId = res.locals.user.id;

		if (!["like", "dislike", "star"].includes(type)) {
			res.status(400).json({ error: "Invalid type" });
			return;
		}

		const oppositeType = type === "like" ? "dislike" : type === "dislike" ? "like" : null;

		// const session = await Interaction.startSession();
		// session.startTransaction();

		const existing = await Interaction.findOne({ userId, blogId, type });

		if (existing) {
			await Interaction.deleteOne({ _id: existing._id });
			await Blog.findOneAndUpdate({ _id: blogId, state: "published" }, { $inc: { [`${type}sCount`]: -1 } });
			// await session.commitTransaction();
			// session.endSession();
			res.status(200).json({ message: `${type} removed` });
			return;
		}

		if (oppositeType) {
			const opposite = await Interaction.findOne({ userId, blogId, type: oppositeType });
			if (opposite) {
				await Interaction.deleteOne({ _id: opposite._id });
				await Blog.findOneAndUpdate({ _id: blogId, state: "published" }, { $inc: { [`${oppositeType}sCount`]: -1 } });
			}
		}

		await Interaction.create([{ userId, blogId, type }]);
		await Blog.findOneAndUpdate({ _id: blogId, state: "published" }, { $inc: { [`${type}sCount`]: 1 } });

		// await session.commitTransaction();
		// session.endSession();
		res.status(201).json({ message: `${type} added` });

	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
};


const getUserInteractions = async (req: Request, res: Response): Promise<void> => {
	try{
		const userId = res.locals.user.id;
		const interactions = await Interaction.find({ userId });
		res.json(interactions);
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
};

export { toggleInteraction, getUserInteractions };