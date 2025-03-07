import { createTransport } from "nodemailer";

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

const sendOtp = async (mailToSend: string, otp: string): Promise<void> => {
    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: mailToSend,
        subject: "Blog API OTP",
        html: `<h4>Your otp for Blog API registration</h4><br><h4>It's valid for 2 minutes</h4><br><h1>${otp}</h1>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent: ", info.response);
    } catch (error) {
        console.error("❌ Error sending email: ", error);
    }
}

export { generateOtp , sendOtp };