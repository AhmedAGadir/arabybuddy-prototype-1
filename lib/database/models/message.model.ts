import { Schema, model, models } from "mongoose";

export interface IMessage extends Document {
	clerkId: string;
	conversationId: string;
	role: "user" | "assistant";
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

const MessageSchema = new Schema(
	{
		conversationId: {
			type: Schema.Types.ObjectId,
			ref: "Conversation",
			required: true,
		},
		clerkId: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ["user", "assistant"],
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Message = models?.Message || model("Message", MessageSchema);

export default Message;
