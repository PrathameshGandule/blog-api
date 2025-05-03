import { Schema , Types, model, Document } from "mongoose";

interface IInteraction extends Document {
    userId: Types.ObjectId,
	blogId: Types.ObjectId,
	type: "like" | "dislike" | "star",
	createdAt: Date
}

const interactionSchema = new Schema<IInteraction>({
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
	type: { type: String, enum: ["like", "dislike", "star"], required: true },
	createdAt: { type: Date, default: Date.now }
});
interactionSchema.index({ userId: 1, blogId: 1, type: 1 }, { unique: true });

const Interaction = model<IInteraction>("Interaction", interactionSchema);

export default Interaction;