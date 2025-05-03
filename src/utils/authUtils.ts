import { Request } from "express"
import { z, ZodIssue } from "zod";
import { redisClient } from "../config/redis.js";
import User, { IUser } from "../models/User.js";
import bcryptjs from "bcryptjs";
const { compare } = bcryptjs;
import { configDotenv } from "dotenv";
configDotenv();

/*----- Schemas -----*/
const loginSchema = z.object({
	email: z.string().email(),
	password: z.string()
});

const registrationSchema = z.object({
	name: z.string().nonempty(),
	email: z.string().email(),
	bio: z.string(),
	password: z.string()
});

const changePassSchema = z.object({
	email: z.string().email(),
	newPassword: z.string()
});

/*----- Custom Errors -----*/
export class InvalidLoginInputError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidLoginInputError";
		Object.setPrototypeOf(this, InvalidLoginInputError.prototype);
	}
}

export class InvalidChangePassError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidChangePassError";
		Object.setPrototypeOf(this, InvalidChangePassError.prototype);
	}
}

// export class InvalidRegisterInputError extends Error {
// 	constructor(message: ZodIssue[]) {
// 		super(message);
// 		this.name = "InvalidRegisterInputError";
// 		Object.setPrototypeOf(this, InvalidRegisterInputError.prototype);
// 	}
// }

export class UserDoesntExistError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UserDoesntExistError";
		Object.setPrototypeOf(this, UserDoesntExistError.prototype);
	}
}

export class UserExistError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UserExistError";
		Object.setPrototypeOf(this, UserExistError.prototype);
	}
}

export class InvalidPasswordError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidPasswordError";
		Object.setPrototypeOf(this, InvalidPasswordError.prototype);
	}
}

export class EmailVerificationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "EmailVerificationError";
		Object.setPrototypeOf(this, EmailVerificationError.prototype);
	}
}

/*----- custom methods -----*/
// export const parseLoginBody = (req: Request): {
// 	email: string;
// 	password: string;
// } => {
// 	const parsedBody = loginSchema.safeParse(req.body);
// 	if (!parsedBody.success) {
// 		throw new InvalidLoginInputError("Invalid email or password");
// 	}
// 	return parsedBody.data;
// }

// export const parseRegisterBody = (req: Request): {
// 	email: string;
// 	password: string;
// 	name: string;
// 	bio: string;
// } => {
// 	const parsedBody = registrationSchema.safeParse(req.body);
// 	if (!parsedBody.success) {
// 		throw new InvalidRegisterInputError(parsedBody.error.errors);
// 	}
// 	return parsedBody.data;
// }

// export const parseChangePassBody = (req: Request): {
// 	email: string;
// 	newPassword: string;
// } => {
// 	const parsedBody = changePassSchema.safeParse(req.body);
// 	if (!parsedBody.success) {
// 		throw new InvalidChangePassError("Invalid email or newPassword");
// 	}
// 	return parsedBody.data;
// }

export const doesUserExistCheck = async (email: string): Promise<IUser> => {
	const user = await User.findOne({ email });
	if (!user) {
		throw new UserDoesntExistError(`User with email ${email} not found !`);
	}
	return user;
}

export const doesUserDoesntExistCheck = async (email: string) => {
	const user = await User.findOne({ email });
	if (user) {
		throw new UserExistError("User with this email already exists, You may Login");
	}
}

export const isPasswordCorrectCheck = async(password: string, actualPassword: string) => {
	const isMatch: boolean = await compare(password, actualPassword);
	if (!isMatch) {
		throw new InvalidPasswordError("Invalid Password !");
	}
}

export const getJwtSecret = (): string => {
	if (!process.env.JWT_SECRET) {
		throw new Error("NO JWT_SECRET provided in .env file!!!")
	}
	return process.env.JWT_SECRET;
}

export const isEmailVerifiedCheck = async(email: string, shouldBeVerified: "true" | "false") => {
	let isVerified = await redisClient.get(`email_verified:${email}`)
	console.log(isVerified);
	if(!isVerified) isVerified = "false";
	console.log(isVerified);
	if (isVerified == "false" || shouldBeVerified == "true") {
		throw new EmailVerificationError("Verify your email first");
	} else if (isVerified === "true" || shouldBeVerified === "false") {
		throw new EmailVerificationError("Your email is already verified");
	}
}