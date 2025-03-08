import { createTransport } from "nodemailer";
import { redisClient } from "../config/redis.js";
import bcryptjs from "bcryptjs";
import { text } from "express";
const { hash , compare } = bcryptjs;

const transporter = createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.APP_PASS
    },
});

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOtp = async (mailToSend: string, otp: string): Promise<boolean> => {
    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: mailToSend,
        subject: "Blog API OTP",
        text: `Your email verification otp for Blog API is ${otp}\nIt's valid for only 2 minutes`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        // console.log("✅ Email sent: ", info);
        return true;
    } catch (error) {
        console.error("❌ Error sending email: ", error);
        return false;
    }
}

export {generateOtp , sendOtp };