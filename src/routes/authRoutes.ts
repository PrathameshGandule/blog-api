import { Router } from "express"
import { register, login, changePassword } from "../controllers/authController.js";
import { sendOtpToUser , verifyOtpFromUser } from "../controllers/otpController.js";

import { 
    registerLimiter, 
    loginLimiter, 
    forgotPasswordLimiter, 
    sendOTPLimiter, 
    verifyOTPLimiter 
} from "../middlewares/rateLimiterMiddleware.js";


const router = Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPasswordLimiter, changePassword);
router.post('/send-otp', sendOTPLimiter, sendOtpToUser);
router.post('/verify-otp', verifyOTPLimiter, verifyOtpFromUser);

export default router;