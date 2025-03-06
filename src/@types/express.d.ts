import { JwtPayload } from "jsonwebtoken";
import { Document, Types } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload; // Add 'user' property to Request
        }
    }
}


