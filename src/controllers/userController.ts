import { Request , Response } from "express";
import User from "../models/User.js";
import { Types } from "mongoose";

const toggleFollow = async (req: Request, res: Response): Promise<void> => {
	try {
		const currentUserId = res.locals.user.id;
		
		if (!Types.ObjectId.isValid(req.params.targetUserId)) {
			res.status(400).json({ message: "Invalid user ID" });
			return;
		}
		const targetUserId = new Types.ObjectId(req.params.targetUserId);

		if (currentUserId === targetUserId) {
			res.status(400).json({ message: "You cannot follow yourself" });
			return;
		}

		const currentUser = await User.findById(currentUserId);
		if (!currentUser) {
			res.status(404).json({ message: "Current user not found" });
			return;
		}

		const isFollowing = currentUser.following.includes(targetUserId);

		if (isFollowing) {
			// Unfollow
			await User.findByIdAndUpdate(currentUserId, {
				$pull: { following: targetUserId }
			});
			res.status(200).json({ message: "Unfollowed successfully" });
		} else {
			// Follow
			await User.findByIdAndUpdate(currentUserId, {
				$addToSet: { following: targetUserId }
			});
			res.status(200).json({ message: "Followed successfully" });
		}
	} catch (err) {
		console.error("❌ Error in toggleFollow:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
};

const getFollowing = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.params.userId;

		const user = await User.findById(userId).populate("following", "name email");
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({ following: user.following });
	} catch (err) {
		console.error("❌ Error in getFollowing:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
};

const getFollowers = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.params.userId;

		const followers = await User.find({ following: userId }).select("name email");

		res.status(200).json({ followers });
	} catch (err) {
		console.error("❌ Error in getFollowers:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
};

const getUsers = async (req: Request, res: Response): Promise<void> => {
	try {
		const users = await User.find().select("name email");
		res.status(200).json(users);
	} catch (err) {
		console.error("❌ Error in getFollowers:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
};

const getUserById = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!Types.ObjectId.isValid(req.params.targetUserId)) {
			res.status(400).json({ message: "Invalid user ID" });
			return;
		}
		const targetUserId = new Types.ObjectId(req.params.targetUserId);
		const user = await User.findOne({ _id: targetUserId }).select("name email bio following");
		res.status(200).json(user);
	} catch (err) {
		console.error("❌ Error in getFollowers:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
};

export {
	toggleFollow,
	getFollowing,
	getFollowers,
	getUsers,
	getUserById
}