import Conversation from "@/lib/database/models/conversation.model";
import Message, { IMessage } from "@/lib/database/models/message.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";

export async function GET(
	req: Request,
	{ params }: { params: { conversationId: string } }
) {
	try {
		const { userId, protect } = auth();

		protect();

		await connectToDatabase();

		const { conversationId } = params;

		console.log(
			"fetching conversation messages - conversationId:",
			conversationId
		);

		const messages = await Message.find({
			clerkId: userId,
			conversationId,
		}).sort({
			createdAt: 1, // sort by oldest
		});

		return Response.json(
			{
				messages,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching conversation messages:", error);
		return Response.error();
	}
}

export async function POST(
	req: Request,
	{ params }: { params: { conversationId: string } }
) {
	try {
		const { userId, protect } = auth();

		protect();

		const { conversationId } = params;

		await connectToDatabase();

		const message: IMessage = await req.json();

		const { content, role, translation, _id } = message;

		console.log("creating new message - conversationId:", conversationId);

		const newMessage = await Message.create({
			clerkId: userId,
			conversationId,
			...(_id ? { _id } : {}),
			role,
			content,
			...(translation ? { translation } : {}),
		});

		console.log("new message created", newMessage);

		return Response.json(
			{
				message: newMessage,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error creating new conversation:", error);
		return Response.error();
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { conversationId: string; messageId: string } }
) {
	try {
		const { userId, protect } = auth();

		protect();

		const { conversationId } = params;

		await connectToDatabase();

		const { messageIds } = await req.json();

		console.log("deleting messages: ", messageIds);

		const messages = await Message.deleteMany({
			clerkId: userId,
			conversationId,
			_id: { $in: messageIds },
		});

		console.log("deleted messages", messages);

		return Response.json(
			{
				messages,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting message:", error);
		return Response.error();
	}
}
