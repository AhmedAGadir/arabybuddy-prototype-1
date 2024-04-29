import Conversation from "@/lib/database/models/conversation.model";
import Message from "@/lib/database/models/message.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";

export async function POST(
	req: Request,
	{ params }: { params: { conversationId: string } }
) {
	try {
		const { userId } = auth();

		if (!userId) {
			throw new Error("User not authenticated");
		}

		console.log("******** params", params);
		const { conversationId } = params;

		await connectToDatabase();

		const { content, role } = await req.json();

		console.log(
			"creating new message - userId:",
			userId,
			" conversationId:",
			conversationId
		);

		const newMessage = await Message.create({
			clerkId: userId,
			conversationId,
			role,
			content,
		});

		console.log("new message created", JSON.stringify(newMessage));

		// update last message in conversation

		await Conversation.findOneAndUpdate(
			{ _id: conversationId },
			{ $set: { lastMessage: content } },
			{ new: true }
		);

		console.log("updated lastMessage in conversation, id:", conversationId);

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
