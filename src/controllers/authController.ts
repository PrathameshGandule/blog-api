import pkg from "bcryptjs";
const { hash, compare } = pkg;
import jpkg from 'jsonwebtoken';
const { sign } = jpkg;
import User from "../models/User.js"
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();


const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const name: string = req.body.name;
		const email: string = req.body.email;
		const password: string = req.body.password;

		if (!name || !email || !password) {
			res.status(400).json({ message: "Please fill all fields !" });
			return;
		}

		const user: IUser | null = await User.findOne({ email });

		if (user) {
			res.status(400).json({
				message: `User with email ${email} already exists !`
			});
			return;
		}

		const hashedPassword: string = await hash(password, 10);

		const newUser: IUser = new User({ name, email, password: hashedPassword });
		await newUser.save();
		res.status(201).json({
			message: `User registered with email ${email}`
		});
	} catch (err: unknown) {
		console.error("❌ Some error occurred:", err instanceof Error ? err : err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
};

const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const email: string = req.body.email;
		const password: string = req.body.password;

		if (!email || !password) {
			res.status(400).json({ message: "Please fill all fields !" });
			return;
		}

		const user: IUser | null = await User.findOne({ email });

		if (!user) {
			res.status(404).json({
				message: `User with username ${email} not found !`
			});
			return;
		}

		const isMatch: boolean = await compare(password, user.password);
		if (!isMatch) {
			res.status(400).json({ message: "Invalid Password !" })
			return;
		}

		if (!process.env.JWT_SECRET) {
			throw new Error("NO JWT_SECRET provided in .env file!!!")
		}
		const jwt_secret: string = process.env.JWT_SECRET;
		const token: string = sign(
			{ id: user._id },
			jwt_secret,
			{ expiresIn: "5d" }
		)

		res.status(200).json({
			message: "Login successful",
			token
		});
	} catch (err: unknown) {
		console.error("❌ Some error occurred:", err instanceof Error ? err.message : err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

export { register, login };