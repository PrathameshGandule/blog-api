import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { string, z } from "zod";

// Middleware function with type assertion
const validateBlogParams = (...validate: string[]): (req: Request, res: Response, next: NextFunction) => void => {
	return (req: Request, res: Response, next: NextFunction): void => {
		// res.locals.validatedData = {};
		res.locals.validatedData ||= {} as typeof res.locals.validatedData;
		// make sure state is either 'draft' or 'published' only
		if (validate.includes("state")) {
			if (req.params.state === "draft" || req.params.state === "published") {
				res.locals.validatedData.state = req.params.state;
			} else {
				res.status(400).json({ message: "State must be draft or published" });
				return
			}
		}

		// make sure the id is a valid mongodb ObjectId
		if (validate.includes("blogId")) {
			if (Types.ObjectId.isValid(req.params.blogId)) {
				res.locals.validatedData.blogId = new Types.ObjectId(req.params.blogId);
			} else {
				res.status(400).json({ message: "Invalid blogId" });
				return;
			}
		}

		if (validate.includes("commentId")) {
			if (Types.ObjectId.isValid(req.params.commentId)) {
				res.locals.validatedData.commentId = new Types.ObjectId(req.params.commentId);
			} else {
				res.status(400).json({ message: "Invalid commentId" });
				return;
			}
		}

		// make sure anon query parameter is either 'true' or 'false'
		if (validate.includes("anon")) {
			if (req.query.anon === "true" || req.query.anon === "false") {
				res.locals.validatedData.anon = req.query.anon;
			} else {
				res.status(400).json({ message: "anon must be true or false" });
				return;
			}
		}

		// make sure anonBlogDeleteId exists
		if (validate.includes("anonBlogDeleteId")){
			if(req.query.deleteId){
				res.locals.validatedData.anonBlogdeleteId = req.query.deleteId as string;
			} else {
				res.status(400).json({ message: "Please provide deleteId" });
				return;
			}
		}
		// console.log(res.locals.validatedData);
		next();
	};
}

const valiDateBody = (req: Request, res: Response, next: NextFunction): void => {
	// res.locals.validatedBody = {};
	res.locals.validatedBody ||= {} as typeof res.locals.validatedBody;
	const blogSchema = z.object({
		title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters").nonempty(),
		content: z.string().min(1, "Content is required").nonempty(),
		tags: z.array(z.string()),
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
	res.locals.validatedBody = parsedBody.data;
	// console.log(res.locals.validatedBody);
	next();
}

export { validateBlogParams, valiDateBody };
