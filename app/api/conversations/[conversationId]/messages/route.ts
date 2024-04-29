import Message from "@/lib/database/models/message.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";

export async function GET(
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

		console.log(
			"fetching conversation messages - userId:",
			userId,
			" conversationId:",
			conversationId
		);

		const messages = await Message.find({
			clerkId: userId,
			conversationId,
		}).sort({
			updatedAt: 1, // sort by oldest
		});

		console.log("conversation messages found", JSON.stringify(messages));

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
