import { IPreferences } from "@/lib/database/models/preferences.model";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import {
	CompletionMode,
	OpenAIMessage,
	completionMode,
	getSystemMessage,
	openAiChatCompletionStream,
} from "@/lib/api/assistant";

export const maxDuration = 60; // seconds

export const config = {
	runtime: "edge",
};

// remember API calls wont work if the account balance is 0
const openai = new OpenAI({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY,
});

type RequestBody = {
	messageHistory: OpenAIMessage[];
	mode: CompletionMode;
	firstName: string | undefined;
	preferences: {
		arabic_dialect: IPreferences["arabic_dialect"];
		assistant_language_level: IPreferences["assistant_language_level"];
		assistant_tone: IPreferences["assistant_tone"];
		assistant_detail_level: IPreferences["assistant_detail_level"];
		user_interests: IPreferences["user_interests"];
		user_personality_traits: IPreferences["user_personality_traits"];
	};
};

export async function POST(req: Request, res: Response) {
	try {
		const { userId } = auth();

		if (!userId) {
			throw new Error("User not authenticated");
		}

		const { messageHistory, mode, firstName, preferences }: RequestBody =
			await req.json();

		console.log(`completion mode: ${mode}`);

		const systemMessage = getSystemMessage({ mode, preferences, firstName });

		console.log("systemMessage:", systemMessage);

		// TODO: dialect needs to be added on the message itself ?

		const latestMessage = messageHistory[messageHistory.length - 1];

		const messages =
			mode === completionMode.TRANSLATE || mode === completionMode.REPHRASE
				? [latestMessage]
				: messageHistory;

		const stream = await openAiChatCompletionStream({
			systemMessage,
			messages,
			openai,
		});

		return new Response(stream);
	} catch (error) {
		console.error("Error connection to OpenAI", error);
		return Response.error();
	}
}
