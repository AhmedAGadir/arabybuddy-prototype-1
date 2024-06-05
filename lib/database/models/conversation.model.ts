import { ChatPartnerId } from "@/lib/chatPartners";
import { ArabicDialect } from "@/types/types";
import { Schema, model, models } from "mongoose";

export interface IConversation extends Document {
	_id: string;
	clerkId: string;
	chatPartnerId: ChatPartnerId;
	chatDialect: ArabicDialect;
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
		chatPartnerId: {
			type: String,
			required: true,
		},
		chatDialect: {
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
		strict: false,
	}
);

const Conversation =
	models?.Conversation || model("Conversation", ConversationSchema);

export default Conversation;
