import { Router } from "express"
import verifyToken from "../middlewares/authMiddleware.js";
import { validateBlogParams } from "../middlewares/blogMiddleware.js";
import {
	addComment,
	deleteComment,
	updateComment,
	getAllParentComments,
	getAllReplyComments,
	toggleLikeComment
} from "../controllers/commentController.js";

const router = Router();

router.post('/:blogId', verifyToken, validateBlogParams("blogId"), addComment);
router.delete('/:commentId', verifyToken, validateBlogParams("commentId"), deleteComment);
router.put('/:commentId', verifyToken, validateBlogParams("commentId"), updateComment);
router.get('/parent/:blogId', verifyToken, validateBlogParams("blogId"), getAllParentComments);
router.get('/reply/:commentId', verifyToken, validateBlogParams("commentId"), getAllReplyComments);
router.post('/toggle/:commentId', verifyToken, validateBlogParams("commentId"), toggleLikeComment);

export default router;