import Conversation from "@/lib/database/models/conversation.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request, res: Response) {
	try {
		const { userId } = auth();

		if (userId) {
			await connectToDatabase();

			console.log("fetching user conversations - userId", userId);

			const conversations = await Conversation.find({ clerkId: userId }).sort({
				updatedAt: -1, // Sort by most recent
			});

			console.log("user conversations found", JSON.stringify(conversations));

			return Response.json(
				{
					conversations: conversations,
				},
				{ status: 200 }
			);
		} else {
			throw new Error("User not authenticated");
		}
	} catch (error) {
		console.error("Error fetching user conversations:", error);
		return Response.error();
	}
}
