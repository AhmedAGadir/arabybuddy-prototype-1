import Conversation from "@/lib/database/models/conversation.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
	try {
		const { userId } = auth();

		if (!userId) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		console.log("creating new conversation - userId", userId);

		const newConversation = await Conversation.create({
			clerkId: userId,
		});

		console.log("new conversation created", JSON.stringify(newConversation));

		return Response.json(newConversation, { status: 200 });
	} catch (error) {
		console.error("Error creating new conversation:", error);
		return Response.error();
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { conversationId: string } }
) {
	try {
		const { userId } = auth();

		if (!userId) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		const { conversationId } = params;

		console.log("deleting conversation - conversationId", conversationId);

		const deletedConversation = await Conversation.findOneAndDelete({
			clerkId: userId,
			_id: conversationId,
		});

		if (!deletedConversation) {
			throw new Error("Conversation not found");
		}

		console.log("conversation deleted", JSON.stringify(deletedConversation));

		return Response.json(deletedConversation, { status: 200 });
	} catch (error) {
		console.error("Error converting speech to text:", error);
		return Response.error();
	}
}
