import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

// Middleware function with type assertion
const validateBlogParams = (...validate: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (validate.includes("state")) {
            const isStateValid = req.params.state === "draft" || req.params.state === "published"
            if (!isStateValid) {
                res.status(400).json({ success: false, message: "Invalid state" });
                return
            }
        }
        if (validate.includes("id")) {
            const isIdValid = Types.ObjectId.isValid(req.params.id);
            if (!isIdValid) {
                res.status(400).json({ success: false, message: "Invalid Id" });
                return;
            }
        }
        if(validate.includes("anon")){
            const isAnonQueryValid = req.query.anon === "true" || req.query.anon === "false";
            if(!isAnonQueryValid){
                res.status(400).json({ success: false, message: "Invalid query parameter for anon" });
                return;
            }
        }
        next();
    };
}

export default validateBlogParams
