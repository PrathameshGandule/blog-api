import { Router } from "express";

import { 
	getBlogById, 
	getBlogsWithSearch 
} from "../controllers/publicController.js";

const router = Router();

router.get('/blogs', getBlogsWithSearch)
router.get('/blog/:id', getBlogById);

export default router;