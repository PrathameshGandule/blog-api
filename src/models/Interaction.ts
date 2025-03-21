import { Schema , Types, model } from "mongoose";

interface IInteraction extends Document {
    blogId: Types.ObjectId,
    likes: Types.ObjectId[],
    saves: Types.ObjectId[],
    shares: Types.ObjectId[]
}

const interactionSchema = new Schema<IInteraction>({
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true, unique: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User", unique: true }],
    saves: [{ type: Schema.Types.ObjectId, ref: "User", unique: true }],
    shares: [{ type: Schema.Types.ObjectId, ref: "User", unique: true }]
}, { timestamps: true });

const Interaction = model<IInteraction>("Interaction", interactionSchema);

export default Interaction;