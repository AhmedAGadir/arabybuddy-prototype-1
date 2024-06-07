import { Schema, model, models } from "mongoose";

export interface ITranslation {
	arabic: string;
	english: string;
}

export interface IMessage extends Document {
	_id: string;
	clerkId: string;
	conversationId: string;
	role: "user" | "assistant";
	content: string;
	translation?: ITranslation[];
	createdAt: string;
	updatedAt: string;
}

const TranslationSchema = new Schema(
	{
		arabic: { type: String },
		english: { type: String },
	},
	{ _id: false }
);

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
		translation: {
			type: [TranslationSchema],
			required: false,
		},
	},
	{
		timestamps: true,
		strict: false,
	}
);

const Message = models?.Message || model("Message", MessageSchema);

export default Message;
