import { Schema, model, models } from "mongoose";

export interface IMessage extends Document {
	_id: string;
	clerkId: string;
	conversationId: string;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
	updatedAt: string;
}

const MessageSchema = new Schema(
	{
		clerkId: {
			type: String,
			required: true,
		},
		conversationId: {
			type: Schema.Types.ObjectId,
			ref: "Conversation",
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
