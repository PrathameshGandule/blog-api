import { createTransport } from "nodemailer";

// transporter to send mail 
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

// generate a random 6 digit otp
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// otp sender function
const sendOtp = async (mailToSend: string, otp: string): Promise<void> => {
    // mail sender configuration
    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: mailToSend,
        subject: "Blog API OTP",
        text: `Your email verification otp for Blog API is ${otp}\nIt's valid for only 2 minutes`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("❌ Error sending email: ", error);
    }
}

const sendAnonDeleteMail = async (mailToSend: string, anonBlogDeleteId: string): Promise<void> => {
	// mail sender configuration
	const mailOptions = {
		from: process.env.USER_EMAIL,
		to: mailToSend,
		subject: "Your anon blog's delete token",
		text: `Your anonymous blog's delete token is as follows\n${anonBlogDeleteId}\nUse this if you ever wish to delete your anonymous blog`
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error("❌ Error sending email: ", error);
	}
}

export { generateOtp, sendOtp, sendAnonDeleteMail };