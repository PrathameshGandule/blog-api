import { Router } from "express"

import {
	addBlog,
	deleteBlog,
	updateBlog,
	getBlogs
} from "../controllers/userController.js"

import verifyToken from "../middlewares/authMiddleware.js";

const router: Router = Router();

router.post('/blog/add', verifyToken, addBlog);
router.delete('/blog/delete/:id', verifyToken, deleteBlog);
router.put('/blog/update/:id', verifyToken, updateBlog);
router.get('/blogs', verifyToken, getBlogs);

export default router;