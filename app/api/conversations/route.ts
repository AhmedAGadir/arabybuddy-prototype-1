import Conversation from "@/lib/database/models/conversation.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request, res: Response) {
	try {
		const { userId, protect } = auth();

		protect();

		await connectToDatabase();

		console.log("fetching user conversations for", userId);

		const conversations = await Conversation.find({ clerkId: userId }).sort({
			updatedAt: -1, // Sort by most recent
		});

		return Response.json(
			{
				conversations,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching user conversations:", error);
		return Response.error();
	}
}

export async function POST(req: Request) {
	try {
		const { userId, protect } = auth();

		protect();

		await connectToDatabase();

		const { chatPartnerId, chatDialect } = await req.json();

		console.log(
			`creating new ${chatDialect} conversation with ${chatPartnerId} for`,
			userId
		);

		const newConversation = await Conversation.create({
			clerkId: userId,
			chatPartnerId,
			chatDialect,
		});

		console.log(
			`new ${chatDialect} conversation with ${chatPartnerId} created`,
			newConversation
		);

		return Response.json(newConversation, { status: 200 });
	} catch (error) {
		console.error("Error creating new conversation:", error);
		return Response.error();
	}
}
