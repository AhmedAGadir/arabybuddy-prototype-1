"use server";
// server actions are a a simpler alternatives to API routes

import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createUser(user: CreateUserParams) {
	try {
		await connectToDatabase();

		console.log("creating new user");

		const newUser = await User.create(user);

		console.log("new user created", JSON.stringify(newUser));

		return JSON.parse(JSON.stringify(newUser));
	} catch (error) {
		handleError(error);
	}
}

// READ
export async function getUserById(userId: string) {
	try {
		await connectToDatabase();

		console.log("finding user by id", userId);

		const user = await User.findOne({ clerkId: userId });

		if (!user) throw new Error("User not found");

		console.log("user found", JSON.stringify(user));

		return JSON.parse(JSON.stringify(user));
	} catch (error) {
		handleError(error);
	}
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
	try {
		await connectToDatabase();

		console.log("updating user", clerkId, user);

		const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
			new: true,
		});

		if (!updatedUser) throw new Error("User update failed");

		console.log("user updated", JSON.stringify(updatedUser));

		return JSON.parse(JSON.stringify(updatedUser));
	} catch (error) {
		handleError(error);
	}
}

// DELETE
export async function deleteUser(clerkId: string) {
	try {
		await connectToDatabase();

		console.log("deleting user", clerkId);

		// Find user to delete
		const userToDelete = await User.findOne({ clerkId });

		if (!userToDelete) {
			throw new Error("User not found");
		}

		console.log("deleting user", JSON.stringify(userToDelete));

		// Delete user
		const deletedUser = await User.findByIdAndDelete(userToDelete._id);
		revalidatePath("/");

		console.log("user deleted", JSON.stringify(deletedUser));

		return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
	} catch (error) {
		handleError(error);
	}
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
	try {
		await connectToDatabase();

		console.log("updating user credits", userId, creditFee);

		const updatedUserCredits = await User.findOneAndUpdate(
			{ _id: userId },
			{ $inc: { creditBalance: creditFee } },
			{ new: true }
		);

		if (!updatedUserCredits) throw new Error("User credits update failed");

		console.log("user credits updated", JSON.stringify(updatedUserCredits));

		return JSON.parse(JSON.stringify(updatedUserCredits));
	} catch (error) {
		handleError(error);
	}
}
