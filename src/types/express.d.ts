// src/types/express.d.ts

import type { Types } from "mongoose";
import type { JwtPayload } from "jsonwebtoken";

// ✅ Still works if you ensure it's not treated as a module
export { };

interface userPL extends JwtPayload {
	id: Types.ObjectId;
}

declare global {
	namespace Express {
		interface Locals {
			user: userPL
			validatedData: {
				state: "draft" | "published";
				anon: "true" | "false";
				blogId: Types.ObjectId;
				anonBlogdeleteId: string;
				commentId: Types.ObjectId;
			};
			validatedBody: {
				title: string;
				content: string;
				tags: string[];
				category: Types.ObjectId;
			};
		}
	}
}

