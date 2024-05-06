import { IMessage } from "@/lib/database/models/message.model";
import { IPreferences } from "@/lib/database/models/preferences.model";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { TextContentBlock } from "openai/resources/beta/threads/messages/messages.mjs";

export const maxDuration = 60; // seconds

// remember API calls wont work if the account balance is 0
const openai = new OpenAI({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
	try {
		const { userId } = auth();

		if (!userId) {
			throw new Error("User not authenticated");
		}

		const { messageHistory, mode, firstName, preferences } = await req.json();

		const { updatedMessages } = await openAIAddChatMessageAndAwaitResponse({
			messageHistory,
			mode,
			firstName,
			preferences,
		});

		return Response.json(
			{
				messages: updatedMessages,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error connection to OpenAI Asssistant API", error);
		return Response.error();
	}
}

function createAssistantInstructions(
	firstName: string | undefined,
	preferences: {
		arabic_dialect: IPreferences["arabic_dialect"];
		assistant_language_level: IPreferences["assistant_language_level"];
		assistant_tone: IPreferences["assistant_tone"];
		assistant_detail_level: IPreferences["assistant_detail_level"];
		user_interests: IPreferences["user_interests"];
		user_personality_traits: IPreferences["user_personality_traits"];
	}
) {
	let instructions = "You are 'ArabyBuddy', a friendly Arabic language tutor. ";

	if (firstName) {
		instructions += `You are here to converse with ${firstName}. make sure you include their name in your initial greeting.`;
	}

	instructions += `Offer engaging topics of conversation based on the user's interests and personality traits. Speak in ${preferences.arabic_dialect} dialect and at a ${preferences.assistant_language_level} language level. Your responses should be ${preferences.assistant_tone} and provide ${preferences.assistant_detail_level} level of detail. `;

	if (preferences.user_interests.length > 0) {
		instructions += `Consider the user's interests such as ${preferences.user_interests.join(
			", "
		)} when choosing topics. `;
	}

	if (preferences.user_personality_traits.length > 0) {
		instructions += `Adapt your interaction style to match personality traits like ${preferences.user_personality_traits.join(
			", "
		)}.`;
	}

	return instructions;
}

const openAIAddChatMessageAndAwaitResponse = async ({
	messageHistory,
	mode,
	firstName,
	preferences,
}: {
	messageHistory: Pick<IMessage, "role" | "content">[];
	firstName: string | undefined;
	mode: "rephrase" | "regenerate" | undefined;
	preferences: {
		arabic_dialect: IPreferences["arabic_dialect"];
		assistant_language_level: IPreferences["assistant_language_level"];
		assistant_tone: IPreferences["assistant_tone"];
		assistant_detail_level: IPreferences["assistant_detail_level"];
		user_interests: IPreferences["user_interests"];
		user_personality_traits: IPreferences["user_personality_traits"];
	};
}) => {
	// create the assistant
	const instructions = createAssistantInstructions(firstName, preferences);
	console.log("Creating assistant - instructions", instructions);

	const assistant = await openai.beta.assistants.create({
		name: "ArabyBuddy",
		instructions,
		model: "gpt-4-turbo-preview",
	});

	const latestMessage = messageHistory[messageHistory.length - 1];
	const messageHistoryWithoutLatest = messageHistory.slice(
		0,
		messageHistory.length - 1
	);

	console.log("Adding message history to thread", messageHistoryWithoutLatest);
	// create the thread and pass all previous messages
	const thread = await openai.beta.threads.create({
		messages: messageHistoryWithoutLatest,
	});

	console.log("adding latest chat message to thread", latestMessage);
	// add transcription to thread
	await openai.beta.threads.messages.create(thread.id, latestMessage);

	if (mode === "rephrase") {
		console.log("adding rephrase instructions...");
	}

	console.log("polling....");
	// run the thread with the assistant
	const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
		assistant_id: assistant.id,
		...(mode === "rephrase"
			? {
					instructions: `rephrase the users latest message so that it sounds more natural in ${preferences.arabic_dialect} dialect`,
			  }
			: {}),
	});

	console.log("run.status", run.status);
	let updatedMessages = [];

	if (run.status === "completed") {
		const messagesPage: OpenAI.Beta.Threads.Messages.MessagesPage =
			await openai.beta.threads.messages.list(run.thread_id);

		updatedMessages = messagesPage.data.reverse().map((message) => ({
			role: message.role,
			content: (message.content[0] as TextContentBlock).text.value,
		}));
		console.log("updatedMessages", updatedMessages);
	} else {
		throw new Error("Thread run either failed or is not completed");
	}

	return { updatedMessages };
};
