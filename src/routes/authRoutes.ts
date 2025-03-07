import { Router } from "express"
import { register, login } from "../controllers/authController.js";
import { sendOtpToUser , verifyOtpFromUser } from "../controllers/otpController.js";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtpToUser);
router.post('/verify-otp', verifyOtpFromUser)

export default router;