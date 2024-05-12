import Conversation from "@/lib/database/models/conversation.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
	req: Request,
	{ params }: { params: { conversationId: string } }
) {
	try {
		const { userId, protect } = auth();

		protect();

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

		console.log("conversation deleted", deletedConversation);

		return Response.json(deletedConversation, { status: 200 });
	} catch (error) {
		console.error("Error converting speech to text:", error);
		return Response.error();
	}
}

export async function PUT(req: Request) {
	try {
		const { userId, protect } = auth();

		protect();

		const { conversation } = await req.json();

		await connectToDatabase();

		console.log("updating conversation - userId", userId, conversation);

		const updatedConversation = await Conversation.findOneAndUpdate(
			{ clerkId: userId, _id: conversation._id },
			conversation,
			{
				new: true,
				strict: false, // keep this because I may continue to modify the schema
			}
		);

		console.log("updatedConversation", updatedConversation);

		return Response.json(updatedConversation, { status: 200 });
	} catch (error) {
		console.error("Error updating conversation:", error);
		return Response.error();
	}
}
