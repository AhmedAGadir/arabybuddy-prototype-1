import { Schema, model, models } from "mongoose";

export interface WordMetadata {
	_id: string;
	arabic: string;
	english: string;
	startTime: number;
	endTime: number;
}

// export interface IMessage extends Document {
export interface IMessage {
	_id: string;
	clerkId: string;
	conversationId: string;
	role: "user" | "assistant";
	content: string;
	wordMetadata: WordMetadata[];
	createdAt: string;
	updatedAt: string;
}

const WordMetadataSchema = new Schema({
	arabic: { type: String },
	english: { type: String },
	startTime: { type: Number },
	endTime: { type: Number },
});

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
		wordMetadata: {
			type: [WordMetadataSchema],
			default: [],
			required: true,
		},
	},
	{
		timestamps: true,
		strict: false,
	}
);

const Message = models?.Message || model("Message", MessageSchema);

export default Message;
