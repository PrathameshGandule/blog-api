import { Schema , model } from "mongoose";

interface ICounter extends Document{
    name: "Blog",
    count: number
}

const counterSchema = new Schema<ICounter>({
    name: { type: String, enum: ["Blog"], unique: true },
    count: { type: Number, default: 1000 }
}, { timestamps: true });

const Counter = model("Counter", counterSchema);

export default Counter;