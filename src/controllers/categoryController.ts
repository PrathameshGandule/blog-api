import { Request, Response } from "express";
import Category from "../models/Category.js";
import { z } from "zod";
import { Types } from "mongoose";

const categorySchema = z.object({
	name: z.string().nonempty(),
	description: z.string().nonempty()
});

const addCategory = async(req: Request, res: Response): Promise<void> => {
	try{
		const parsedBody = categorySchema.safeParse(req.body);
		if (!parsedBody.success) {
			res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
			return;
		}
		const { name , description } = parsedBody.data;
		const category = await Category.create({
			name,
			description
		});
		res.status(200).json({ message: `New category with name ${name} created !` });
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const updateCategory = async (req: Request, res: Response): Promise<void> => {
	try{
		const categoryId = new Types.ObjectId(req.params.id);
		const parsedBody = categorySchema.safeParse(req.body);
		if (!parsedBody.success) {
			res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
			return;
		}
		const { name, description } = parsedBody.data;
		const category = await Category.findById(categoryId, {
			$set: {
				name,
				description
			} 
		}, { new: true });
		res.status(200).json({ message: "Category updates", category });
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const getCategories = async (req: Request, res: Response): Promise<void> => {
	try{
		const categories = await Category.find()
			.select("-__v -createdAt -updatedAt")
			.lean().exec();
		res.status(200).json({ length: categories.length, categories });
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

export { addCategory, updateCategory, getCategories };