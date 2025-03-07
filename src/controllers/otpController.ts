import { Request, Response } from "express";
import { generateOtp, sendOtp } from "../utils/otpUtil.js";
import { redisClient } from "../config/redis.js";
import bcryptjs from "bcryptjs";
const { hash, compare } = bcryptjs;
import { z } from "zod";

const sendSchema = z.object({
    email: z.string().email()
})

const verifySchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6)
})

const sendOtpToUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedBody = sendSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { email } = parsedBody.data;
        const otp = generateOtp();
        const hashedOtp = await hash(otp, 8);
        await redisClient.setEx(`otp:${email}`, 120, hashedOtp);
        await sendOtp(email, otp);
        res.status(200).json({ message: "Otp sent successfully" });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

const verifyOtpFromUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedBody = verifySchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { email, otp } = parsedBody.data;
        const storedOtpHash = await redisClient.get(`otp:${email}`);
        if (!storedOtpHash) {
            res.status(400).json({ message: "OTP expired or invalid" });
            return;
        }

        const isMatch = await compare(otp, storedOtpHash);
        if (!isMatch){
            res.status(400).json({ message: "Incorrect OTP" });
            return;
        }
        await redisClient.del(`otp:${email}`);
        await redisClient.setEx(`email_verified:${email}`, 120, "true");
        res.status(200).json({ message: "OTP verified successfully! You can register now between 5 minutes." });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

export { sendOtpToUser , verifyOtpFromUser };