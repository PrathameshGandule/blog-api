import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
dotenv.config();

connectDB();

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
	res.status(200).json({ message: "Express + Typescript Server" });
});

import authRoutes from "./routes/authRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import userRoutes from "./routes/userRoutes.js";

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));