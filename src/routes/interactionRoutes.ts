import { Router } from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import { validateBlogParams } from "../middlewares/blogMiddleware.js";

import { toggleInteraction, getUserInteractions } from "../controllers/interactionController.js";

const router = Router();

router.post('/toggle/:blogId', verifyToken, validateBlogParams("blogId"), toggleInteraction);
router.get('/my', verifyToken, getUserInteractions);

export default router;