import { Router } from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import { toggleFollow, getFollowing, getFollowers, getUserById, getUsers } from "../controllers/userController.js";

const router = Router();

router.post("/follow/:targetUserId", verifyToken, toggleFollow);
router.get("/following/:userId", verifyToken, getFollowing);
router.get("/followers/:userId", verifyToken, getFollowers);
router.get('/', verifyToken, getUsers);	
router.get('/:targetUserId', verifyToken, getUserById);

export default router;
