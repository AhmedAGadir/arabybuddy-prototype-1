import OpenAI from "openai";
import { IMessage } from "../database/models/message.model";
import { IPreferences } from "../database/models/preferences.model";

export type OpenAIMessage = Pick<IMessage, "role" | "content">;

export const completionMode = {
	REPHRASE: "REPHRASE",
	REGENERATE: "REGENERATE",
	TRANSLATE: "TRANSLATE",
	DEFAULT: "DEFAULT",
} as const;

export type CompletionMode =
	(typeof completionMode)[keyof typeof completionMode];

export const getSystemMessage = ({
	mode,
	firstName,
	preferences,
}: {
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
}) => {
	let systemMessage =
		"You are 'ArabyBuddy', a friendly Arabic language tutor. ";

	if (mode === completionMode.TRANSLATE) {
		systemMessage += `Our goal is to help the user learn Arabic and have engaging conversations. You should translate the last message from the ${preferences.arabic_dialect} dialect into english.`;
		return systemMessage;
	}

	if (mode === completionMode.REPHRASE) {
		systemMessage += `Our goal is to help the user learn Arabic and have engaging conversations. You should rephrase the last message to make it sound more natural and flow better in the ${preferences.arabic_dialect} dialect. Rephrase it from the perspective of the user.`;
		return systemMessage;
	}

	if (firstName) {
		systemMessage += `You are here to converse with ${firstName}. make sure you include their name in your initial greeting.`;
	}

	systemMessage += `Offer engaging topics of conversation based on the user's interests and personality traits.`;

	//  dialect and language level
	systemMessage += `Speak in ${preferences.arabic_dialect} dialect and at a ${preferences.assistant_language_level} language level.`;

	// tone
	systemMessage += `Your responses should be ${preferences.assistant_tone}.`;

	// detail level
	const detailLevelWordCount = {
		low: [20, 70],
		medium: [70, 120],
		high: [120, 160],
	};
	systemMessage += `Aim for between ${
		detailLevelWordCount[preferences.assistant_detail_level][0]
	} to ${
		detailLevelWordCount[preferences.assistant_detail_level][1]
	} words per response. `;

	// interests
	if (preferences.user_interests.length > 0) {
		systemMessage += `Consider the user's interests such as ${preferences.user_interests.join(
			", "
		)} when choosing topics. `;
	}

	// personality traits
	if (preferences.user_personality_traits.length > 0) {
		systemMessage += `Adapt your interaction style to match personality traits like ${preferences.user_personality_traits.join(
			", "
		)}.`;
	}

	return systemMessage;
};

// TODO: add max_tokens, temperature, streaming and other options to all completion calls
// TODO: add abort controller to all completion calls

export const openAiChatCompletionStream = async ({
	systemMessage,
	messages,
	openai,
}: {
	systemMessage: string;
	messages: OpenAIMessage[];
	openai: OpenAI;
}) => {
	console.log("creating completion stream...");

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
		stream: true,
	});

	// ***** NEXTJS GUIDE ON STREAMING: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming
	const encoder = new TextEncoder();

	async function* makeIterator() {
		for await (const chunk of completion as any) {
			const content = chunk.choices[0]?.delta?.content ?? "";
			yield encoder.encode(content);
		}
	}

	function iteratorToStream(iterator: any) {
		return new ReadableStream({
			async pull(controller) {
				const { value, done } = await iterator.next();

				if (done) {
					const duration = (Date.now() - startTime) / 1000;
					console.log(
						`[⌛ DURATION = ${duration}s] completion streaming complete`
					);
					controller.close();
				} else {
					controller.enqueue(value);
				}
			},
		});
	}

	const iterator = makeIterator();
	const stream = iteratorToStream(iterator);

	return stream;
};

// // **** without streaming
// const DEPRECATED_openAIChatCompletion = async ({
// 	systemMessage,
// 	messages,
// }: {
// 	systemMessage: string;
// 	messages: OpenAIMessage[];
// }) => {
// 	console.log("creating chat completion...", messages);

// 	const startTime = Date.now();

// 	const completion = await openai.chat.completions.create({
// 		messages: [
// 			{
// 				role: "system",
// 				content: systemMessage,
// 			},
// 			...messages,
// 		],
// 		model: "gpt-4-turbo-preview",
// 	});

// 	const completionMessage = completion.choices[0].message;

// 	const duration = (Date.now() - startTime) / 1000;

// 	console.log(
// 		`[⌛ DURATION = ${duration}s] completion complete`,
// 		completionMessage
// 	);

// 	return { completionMessage };
// };

// // **** without streaming, using assistant API (its slow)
// const DEPRECATED_openAIAddChatMessageAndAwaitResponse = async ({
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
