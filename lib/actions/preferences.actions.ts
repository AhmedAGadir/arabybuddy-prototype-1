"use server";
// server actions are a a simpler alternatives to API routes

import { revalidatePath } from "next/cache";

import Preferences, {
	IPreferences,
} from "../database/models/preferences.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createPreferences(preferences: IPreferences) {
	try {
		await connectToDatabase();

		console.log("creating new preferences");

		const newPreferences = await Preferences.create(preferences);

		console.log("new preferences created", JSON.stringify(newPreferences));

		return JSON.parse(JSON.stringify(newPreferences));
	} catch (error) {
		handleError(error);
	}
}

// READ
export async function getPreferencesById(userId: string) {
	try {
		await connectToDatabase();

		console.log("finding preferences by id", userId);

		const preferences = await Preferences.findOne({ clerkId: userId });

		if (!preferences) throw new Error("Preferences not found");

		console.log("preferences found", JSON.stringify(preferences));

		return JSON.parse(JSON.stringify(preferences));
	} catch (error) {
		handleError(error);
	}
}

// UPDATE
export async function updatePreferences(
	clerkId: string,
	preferences: IPreferences
) {
	try {
		await connectToDatabase();

		console.log("updating preferences", clerkId, preferences);

		const updatedPreferences = await Preferences.findOneAndUpdate(
			{ clerkId },
			preferences,
			{
				new: true,
			}
		);

		if (!updatedPreferences) throw new Error("Preferences update failed");

		console.log("preferences updated", JSON.stringify(updatedPreferences));

		return JSON.parse(JSON.stringify(updatedPreferences));
	} catch (error) {
		handleError(error);
	}
}

// DELETE
export async function deletePreferences(clerkId: string) {
	try {
		await connectToDatabase();

		console.log("deleting preferences", clerkId);

		// Find preferences to delete
		const preferencesToDelete = await Preferences.findOne({ clerkId });

		if (!preferencesToDelete) {
			throw new Error("Preferences not found");
		}

		console.log("deleting preferences", JSON.stringify(preferencesToDelete));

		// Delete preferences
		const deletedPreferences = await Preferences.findByIdAndDelete(
			preferencesToDelete._id
		);
		revalidatePath("/");

		console.log("preferences deleted", JSON.stringify(deletedPreferences));

		return deletedPreferences
			? JSON.parse(JSON.stringify(deletedPreferences))
			: null;
	} catch (error) {
		handleError(error);
	}
}
