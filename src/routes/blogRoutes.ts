import { Router } from "express"

import {
	saveBlog,
    deleteBlog,
    updateBlog,
    publishDraft,
    getBlogsWithSearch,
    getBlogById
} from "../controllers/blogController.js"

import verifyToken from "../middlewares/authMiddleware.js";
import {validateBlogParams} from "../middlewares/blogMiddleware.js";

const router = Router();

// blog routes
router.post('/:state', verifyToken, validateBlogParams("state", "anon"), saveBlog); //?anon=true query for anonymous publishing
router.delete('/:state/:blogId', verifyToken, validateBlogParams("state", "blogId"), deleteBlog);
router.put('/:state/:blogId', verifyToken, validateBlogParams("state", "blogId"), updateBlog);
router.post('/publish/:blogId', verifyToken, validateBlogParams("blogId", "anon"), publishDraft); //?anon=true query for anonymous publishing
router.get('/:state', verifyToken, validateBlogParams("state"), getBlogsWithSearch);
router.get('/:state/:blogId', verifyToken, validateBlogParams("state", "blogId"), getBlogById);

export default router;