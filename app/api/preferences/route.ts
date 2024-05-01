import Preferences from "@/lib/database/models/preferences.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request, res: Response) {
	try {
		const { userId } = auth();

		if (!userId) {
			throw new Error("User not authenticated");
		}

		await connectToDatabase();

		console.log("fetching user preferences - userId", userId);

		const preferences = await Preferences.findOne({ clerkId: userId });

		return Response.json(
			{
				preferences,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching user preferences:", error);
		return Response.error();
	}
}

export async function POST(req: Request) {
	try {
		const { userId } = auth();

		if (!userId) {
			throw new Error("User not authenticated");
		}

		const { preferences } = await req.json();

		await connectToDatabase();

		console.log("creating new user preferences", preferences);

		const newPreferences = await Preferences.create({
			clerkId: userId,
			...preferences,
		});

		return Response.json(newPreferences, { status: 200 });
	} catch (error) {
		console.error("Error creating user preferences:", error);
		return Response.error();
	}
}

export async function PUT(req: Request) {
	try {
		const { userId } = auth();

		if (!userId) {
			throw new Error("User not authenticated");
		}

		const { preferences } = await req.json();

		await connectToDatabase();

		console.log("updating user preferences - userId", userId);

		const updatedPreferences = await Preferences.findOneAndUpdate(
			{ clerkId: userId },
			preferences,
			{
				new: true,
			}
		);

		return Response.json(updatedPreferences, { status: 200 });
	} catch (error) {
		console.error("Error updating user preferences:", error);
		return Response.error();
	}
}
