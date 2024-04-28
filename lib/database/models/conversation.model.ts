import { Schema, model, models } from "mongoose";

export interface IConversation extends Document {
	_id: string;
	clerkId: string;
	createdAt: Date;
	lastMessage: string;
	label?: string;
	updatedAt: Date;
}

const ConversationSchema = new Schema(
	{
		clerkId: {
			type: String,
			required: true,
		},
		lastMessage: {
			type: String,
		},
		label: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const Conversation =
	models?.Conversation || model("Conversation", ConversationSchema);

export default Conversation;
