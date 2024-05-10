import { IMessage } from "@/lib/database/models/message.model";
import { IPreferences } from "@/lib/database/models/preferences.model";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export const maxDuration = 60; // seconds

// remember API calls wont work if the account balance is 0
const openai = new OpenAI({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY,
});

export type OpenAIMessage = Pick<IMessage, "role" | "content">;

type RequestBody = {
	messageHistory: OpenAIMessage[];
	mode: "rephrase" | "regenerate" | "translate" | undefined;
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

const getSystemMessage = ({
	mode,
	firstName,
	preferences,
}: {
	mode: RequestBody["mode"];
	firstName: RequestBody["firstName"];
	preferences: RequestBody["preferences"];
}) => {
	let systemMessage =
		"You are 'ArabyBuddy', a friendly Arabic language tutor. ";

	if (mode === "translate") {
		systemMessage += `Our goal is to help the user learn Arabic and have engaging conversations. You should translate the last message from the ${preferences.arabic_dialect} dialect into english.`;
		return systemMessage;
	}

	if (mode === "rephrase") {
		systemMessage += `Our goal is to help the user learn Arabic and have engaging conversations. You should rephrase the last message to make it sound more natural and flow better in the ${preferences.arabic_dialect} dialect. Rephrase it from the perspective of the user.`;
		return systemMessage;
	}

	if (firstName) {
		systemMessage += `You are here to converse with ${firstName}. make sure you include their name in your initial greeting.`;
	}

	systemMessage += `Offer engaging topics of conversation based on the user's interests and personality traits. Speak in ${preferences.arabic_dialect} dialect and at a ${preferences.assistant_language_level} language level. Your responses should be ${preferences.assistant_tone} and provide ${preferences.assistant_detail_level} level of detail. `;

	if (preferences.user_interests.length > 0) {
		systemMessage += `Consider the user's interests such as ${preferences.user_interests.join(
			", "
		)} when choosing topics. `;
	}

	if (preferences.user_personality_traits.length > 0) {
		systemMessage += `Adapt your interaction style to match personality traits like ${preferences.user_personality_traits.join(
			", "
		)}.`;
	}

	return systemMessage;
};

// TODO: add max_tokens, temperature, streaming and other options to all completion calls
const openAIChatCompletion = async ({
	systemMessage,
	messages,
}: {
	systemMessage: string;
	messages: OpenAIMessage[];
}) => {
	console.log("creating chat completion...", messages);

	const startTime = Date.now();

	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: systemMessage,
			},
			...messages,
		],
		model: "gpt-4-turbo-preview",
	});

	const completionMessage = completion.choices[0].message;

	const duration = (Date.now() - startTime) / 1000;

	console.log(
		`[DURATION = ${duration}s] completion complete`,
		completionMessage
	);

	return { completionMessage };
};

export async function POST(req: Request, res: Response) {
	try {
		const { userId } = auth();

		if (!userId) {
			throw new Error("User not authenticated");
		}

		const { messageHistory, mode, firstName, preferences }: RequestBody =
			await req.json();

		const systemMessage = getSystemMessage({ mode, preferences, firstName });

		console.log("systemMessage", systemMessage);

		// TODO: dialect needs to be added on the message itself ?

		let messages: OpenAIMessage[];

		switch (mode) {
			case "translate": {
				const messageHistoryWithoutLatest = messageHistory.slice(
					0,
					messageHistory.length - 1
				);

				const latestMessage = messageHistory[messageHistory.length - 1];

				console.log("translating message...", latestMessage);

				const { completionMessage: translatedMessage } =
					await openAIChatCompletion({
						systemMessage,
						messages: [latestMessage],
					});

				messages = [
					...messageHistoryWithoutLatest,
					{
						role: latestMessage.role,
						content: translatedMessage.content ?? "",
					},
				];

				break;
			}
			case "rephrase": {
				const messageHistoryWithoutLatest = messageHistory.slice(
					0,
					messageHistory.length - 1
				);

				const latestMessage = messageHistory[messageHistory.length - 1];

				console.log("rephrasing message...", latestMessage);

				const { completionMessage: rephrasedMessage } =
					await openAIChatCompletion({
						systemMessage,
						messages: [latestMessage],
					});

				messages = [
					...messageHistoryWithoutLatest,
					{
						role: latestMessage.role,
						content: rephrasedMessage.content ?? "",
					},
				];

				break;
			}
			default: {
				console.log("generating chat completion...");

				const { completionMessage } = await openAIChatCompletion({
					systemMessage,
					messages: messageHistory,
				});

				messages = [
					...messageHistory,
					{
						role: completionMessage.role,
						content: completionMessage.content ?? "",
					},
				];
			}
		}

		return Response.json({ messages }, { status: 200 });
	} catch (error) {
		console.error("Error connection to OpenAI", error);
		return Response.error();
	}
}

// const openAIAddChatMessageAndAwaitResponse = async ({
// 	firstName,
// 	messageHistory,
// 	preferences,
// }: Pick<RequestBody, "firstName" | "messageHistory" | "preferences">) => {
// 	// create the assistant
// 	const instructions = createAssistantInstructions(firstName, preferences);
// 	console.log("Creating assistant - instructions", instructions);

// 	const assistant = await openai.beta.assistants.create({
// 		name: "ArabyBuddy",
// 		instructions,
// 		model: "gpt-4-turbo-preview",
// 	});

// 	const latestMessage = messageHistory[messageHistory.length - 1];
// 	const messageHistoryWithoutLatest = messageHistory.slice(
// 		0,
// 		messageHistory.length - 1
// 	);

// 	console.log("Adding message history to thread", messageHistoryWithoutLatest);
// 	// create the thread and pass all previous messages
// 	const thread = await openai.beta.threads.create({
// 		messages: messageHistoryWithoutLatest,
// 	});

// 	console.log("adding latest chat message to thread", latestMessage);
// 	// add transcription to thread
// 	await openai.beta.threads.messages.create(thread.id, latestMessage);

// 	console.log("polling....");
// 	// run the thread with the assistant
// 	const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
// 		assistant_id: assistant.id,
// 		// instructions
// 	});

// 	console.log("run.status", run.status);
// 	let updatedMessages = [];

// 	if (run.status === "completed") {
// 		const messagesPage: OpenAI.Beta.Threads.Messages.MessagesPage =
// 			await openai.beta.threads.messages.list(run.thread_id);

// 		updatedMessages = messagesPage.data.reverse().map((message) => ({
// 			role: message.role,
// 			content: (message.content[0] as TextContentBlock).text.value,
// 		}));
// 		console.log("updatedMessages", updatedMessages);
// 	} else {
// 		throw new Error("Thread run either failed or is not completed");
// 	}

// 	return { updatedMessages };
// };
