import { Router } from "express"

import {
	addBlog,
	deleteBlog,
	updateBlog,
	getBlogs,
    getDrafts
} from "../controllers/blogController.js"

import verifyToken from "../middlewares/authMiddleware.js";

const router = Router();

router.post('/', verifyToken, addBlog);
router.delete('/:id', verifyToken, deleteBlog);
router.put('/:id', verifyToken, updateBlog);
router.get('/', verifyToken, getBlogs);
router.get('/drafts', verifyToken, getDrafts);

export default router;