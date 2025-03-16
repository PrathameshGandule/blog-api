import { Router } from "express"

import {
	saveBlog,
    deleteBlog,
    updateBlog,
    publishDraft,
    getBlogsWithSearch,
    getBlogById
} from "../controllers/blogController.js"

import { 
    createBlogLimiter , 
    updateBlogLimiter , 
    deleteBlogLimiter , 
    publishBlogLimiter ,
    authUserGetLimiter
} from "../middlewares/rateLimiterMiddleware.js";

import verifyToken from "../middlewares/authMiddleware.js";
import validateBlogParams from "../middlewares/blogMiddleware.js";

const router = Router();

router.post('/:state', createBlogLimiter, verifyToken, validateBlogParams("state", "anon"), saveBlog); //?anon=true query for anonymous publishing
router.delete('/:state/:id', deleteBlogLimiter, verifyToken, validateBlogParams("state", "id"), deleteBlog);
router.put('/:state/:id', updateBlogLimiter, verifyToken, validateBlogParams("state", "id"), updateBlog);
router.post('/publish/:id', publishBlogLimiter, verifyToken, validateBlogParams("id", "anon"), publishDraft); //?anon=true query for anonymous publishing
router.get('/:state', authUserGetLimiter, verifyToken, validateBlogParams("state"), getBlogsWithSearch);
router.get('/:state/:id', authUserGetLimiter, verifyToken, validateBlogParams("state", "id"), getBlogById);

export default router;