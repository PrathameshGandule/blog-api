import { JwtPayload } from "jsonwebtoken";
import { Document, Types } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload; // Add 'user' property to Request
        }
    }

	interface IBlog extends Document{
		author: Types.ObjectId,
		title: string,
		content: string,
		published: boolean
	}
	
	interface IUser extends Document {
		name: string,
		password: string,
		email: string
	}
}


