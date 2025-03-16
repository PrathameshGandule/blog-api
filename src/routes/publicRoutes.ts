import { Router } from "express";

import { 
	getBlogById, 
	getBlogsWithSearch 
} from "../controllers/publicController.js";

import { generalGetLimiter } from "../middlewares/rateLimiterMiddleware.js";

import validateBlogParams from "../middlewares/blogMiddleware.js";

const router = Router();

router.get('/', generalGetLimiter, getBlogsWithSearch)
router.get('/:id', generalGetLimiter, validateBlogParams("id"), getBlogById);

export default router;