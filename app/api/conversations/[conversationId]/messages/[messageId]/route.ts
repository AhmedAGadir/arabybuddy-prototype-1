import Message from "@/lib/database/models/message.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";

export async function PUT(
	req: Request,
	{ params }: { params: { conversationId: string; messageId: string } }
) {
	try {
		const { userId, protect } = auth();

		protect();

		await connectToDatabase();

		const { conversationId, messageId } = params;

		const { message } = await req.json();

		console.log(
			"updating message - conversationId:",
			conversationId,
			"messageId:",
			messageId,
			"message:",
			message
		);

		const updatedMessage = await Message.findOneAndUpdate(
			{
				_id: messageId,
				clerkId: userId,
				conversationId,
			},
			{ $set: message },
			{
				new: true,
				strict: false, // needed for when adding translations
			}
		);

		if (!updatedMessage) {
			throw new Error("Message not found");
		}

		return Response.json(
			{
				updatedMessage,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating message:", error);
		return Response.error();
	}
}
