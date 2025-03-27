import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { string, z } from "zod";

// Middleware function with type assertion
const validateBlogParams = (...validate: string[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {

		// make sure state is either 'draft' or 'published' only
		if (validate.includes("state")) {
			if (req.params.state === "draft" || req.params.state === "published") {
				req.validatedData.state = req.params.state;
			} else {
				res.status(400).json({ message: "State must be draft or published" });
				return
			}
		}

		// make sure the id is a valid mongodb ObjectId
		if (validate.includes("blogId")) {
			if (Types.ObjectId.isValid(req.params.blogId)) {
				req.validatedData.blogId = new Types.ObjectId(req.params.blogId);
			} else {
				res.status(400).json({ message: "Invalid blogId" });
				return;
			}
		}

		// make sure anon query parameter is either 'true' or 'false'
		if (validate.includes("anon")) {
			if (req.query.anon === "true" || req.query.anon === "false") {
				req.validatedData.anon = req.query.anon;
			} else {
				res.status(400).json({ message: "anon must be true or false" });
				return;
			}
		}

		// make sure anonBlogDeleteId exists
		if (validate.includes("anonBlogDeleteId")){
			if(req.query.deleteId){
				req.validatedData.anonBlogdeleteId = req.query.deleteId as string;
			} else {
				res.status(400).json({ message: "Please provide deleteId" });
				return;
			}
		}
		next();
	};
}

const valiDateBody = (req: Request, res: Response, next: NextFunction): void => {
	const blogSchema = z.object({
		title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
		content: z.string().min(1, "Content is required"),
		tags: z.array(z.string()).optional(),
		category: z.custom<Types.ObjectId>((val) =>
			Types.ObjectId.isValid(val),
			{ message: "Invalid category ID" }
		)	
	});
	const parsedBody = blogSchema.safeParse(req.body);
	if (!parsedBody.success) {
		res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
		return;
	}
	req.validatedBody = parsedBody.data;
	next();
}

export { validateBlogParams, valiDateBody };
