import jpkg, { JwtPayload } from 'jsonwebtoken';
const { verify } = jpkg;
import { Request, Response, NextFunction } from 'express';

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.status(401).json({ message: "No auth token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
        console.error("❌ No JWT secret provided.");
		res.status(500).json({ message: "Internal Server Error" });
        return; 
    }

    try {
        const decodedUser = verify(token, jwt_secret) as JwtPayload;
        req.user = decodedUser;
        next();
    } catch (err: unknown) {
        console.error("❌ Token verification error:", err instanceof Error ? err.message : err);
		res.status(403).json({ message: "Invalid or expired token" }); 
        return; 
    }
};

export default verifyToken;
