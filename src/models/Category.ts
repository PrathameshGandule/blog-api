import { Schema, model, Document } from "mongoose";

interface ICategory extends Document {
    name: string,
    description: string
}

const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true }
}, { timestamps: true });

const Category = model<ICategory>("Category", categorySchema);

export default Category;