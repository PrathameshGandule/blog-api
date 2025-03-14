import { Router } from "express";

import { 
	getBlogById, 
	getBlogsWithSearch 
} from "../controllers/publicController.js";
import validateBlogParams from "../middlewares/blogMiddleware.js";

const router = Router();

router.get('/blogs', getBlogsWithSearch)
router.get('/blog/:id', validateBlogParams("id"), getBlogById);

export default router;