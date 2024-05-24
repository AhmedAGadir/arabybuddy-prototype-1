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
import { ChatPartnerId } from "@/lib/chatPartners";
import { ArabicDialect } from "@/types/types";

export const maxDuration = 60; // seconds

// export const runtime = "edge";

// remember API calls wont work if the account balance is 0
const openai = new OpenAI({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY,
});

export type AssistantPayload = {
	messages: OpenAIMessage[];
	mode: CompletionMode;
	chat: {
		chatPartnerId: ChatPartnerId;
		chatDialect: ArabicDialect;
	};
	user: {
		firstName: string | undefined;
	};
	preferences: {
		assistant_language_level: IPreferences["assistant_language_level"];
		assistant_detail_level: IPreferences["assistant_detail_level"];
		user_interests: IPreferences["user_interests"];
	};
};

export async function POST(req: Request, res: Response) {
	try {
		auth().protect();

		const payload: AssistantPayload = await req.json();

		console.log(`payload: ${payload}`);

		const { messages } = payload;

		const systemMessage = getSystemMessage(payload);

		console.log("systemMessage:", systemMessage);

		// TODO: dialect needs to be added on the message itself ?

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
