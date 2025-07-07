import { Router } from "express"

import {
	saveBlog,
    deleteBlog,
	deleteAnonBlog,
    updateBlog,
    publishDraft,
    getBlogsWithSearch,
    getBlogById
} from "../controllers/blogController.js"

import verifyToken from "../middlewares/authMiddleware.js";
import { validateBlogParams , valiDateBody} from "../middlewares/blogMiddleware.js";

const router = Router();

// blog routes
router.delete('/anonymous/:blogId', verifyToken, validateBlogParams("blogId", "anonBlogDeleteId"), deleteAnonBlog);
router.post('/:state', verifyToken, validateBlogParams("state", "anon"), valiDateBody, saveBlog); //?anon=true query for anonymous publishing
router.delete('/:state/:blogId', verifyToken, validateBlogParams("state", "blogId"), deleteBlog);
router.put('/:state/:blogId', verifyToken, validateBlogParams("state", "blogId"), updateBlog);
router.put('/publish/:blogId', verifyToken, validateBlogParams("blogId", "anon"), publishDraft); //?anon=true query for anonymous publishing
router.get('/:state', verifyToken, validateBlogParams("state"), getBlogsWithSearch); // this is a comment
router.get('/:state/:blogId', verifyToken, validateBlogParams("state", "blogId"), getBlogById);

export default router;