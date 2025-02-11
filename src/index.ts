import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();

connectDB();

const app: Express = express();
const PORT: number = Number(process.env.PORT ?? 5000);

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
	res.send("Express + Typescript Server");
});

import authRoutes from "./routes/authRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import userRoutes from "./routes/userRoutes.js";

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));