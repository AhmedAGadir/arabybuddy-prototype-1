import OpenAI from "openai";
import { IMessage } from "../database/models/message.model";
import { AssistantPayload } from "@/app/api/chat/assistant/route";
import { chatPartners } from "@/lib/chatPartners";

export type OpenAIMessage = Pick<IMessage, "role" | "content">;

export const completionMode = {
	REPHRASE: "REPHRASE",
	REGENERATE: "REGENERATE",
	TRANSLATE: "TRANSLATE",
	DICTIONARY: "DICTIONARY",
	DEFAULT: "DEFAULT",
} as const;

export type CompletionMode =
	(typeof completionMode)[keyof typeof completionMode];

export const getSystemMessage = (payload: AssistantPayload) => {
	const {
		mode,
		chat: { chatPartnerId, chatDialect },
		user: { firstName },
		preferences: {
			assistant_language_level,
			assistant_detail_level,
			user_interests,
		},
	} = payload;

	if (mode === "DICTIONARY") {
		let systemMessage = "";
		systemMessage += `You are an online arabic dictionary than translates from the ${chatDialect} dialect into either english or modern standard arabic depending on the input.`;
		systemMessage += `The input is a JavaScript object with the following format: {word: "string", context: "string", monolingual: boolean}.`;
		systemMessage += `if monolingual is true, you should return the definition in modern standard arabic. Otherwise, you should return the definition in English.`;
		systemMessage += `You must return a JSON object that includes:`;
		systemMessage += `"word" property with the input word as a string.`;
		systemMessage += `"definitions" property containing different meanings for the word as an array of strings.`;
		systemMessage += `"context" property with a 1-2 sentence explanation of what the word means in the context of the input.`;
		systemMessage += `Output should be a raw JSON object with no additional text, comments, or formatting. Ensure that tashkeel is included on every single letter to facilitate easier reading for the user.`;
		return systemMessage;
	}

	if (mode === "TRANSLATE") {
		let systemMessage = "";
		systemMessage += `You are an online arabic translation generator. Translate the last message from the ${chatDialect} dialect into english. `;
		systemMessage += `Output should be the translated text only, with no additional text, comments, or formatting. `;
		return systemMessage;
	}

	if (mode === "REPHRASE") {
		let systemMessage = "";
		systemMessage += `You are an online arabic language tutor that rephrases user input in the ${chatDialect} dialect so that it sounds more natural, flows better and expresses ideas in a way that is more typical of a native speaker. `;
		systemMessage += `Output should be the rephrased text only, with no additional text, comments, or formatting. Ensure that tashkeel is included on every single letter to facilitate easier reading for the user.`;
		return systemMessage;
	}

	const chatPartner = chatPartners.find(
		(partner) => partner.id === chatPartnerId
	);

	if (!chatPartner) {
		throw new Error("Chat partner not found");
	}

	let systemMessage = `You are a role playing character conversing with language learners of the ${chatDialect} Arabic dialect.`;
	systemMessage += `For this conversation, you are role playing as: name: ${chatPartner.name}, role: ${chatPartner.role} `;
	if (chatPartner.location) {
		systemMessage += `, location: ${chatPartner.location[0]}, ${chatPartner.location[2]}. `;
	}
	systemMessage += `Here is your personality profile: ${chatPartner.background}`;
	systemMessage += `Some of the themes your role covers are: ${chatPartner.themes.join(
		", "
	)}. `;
	systemMessage += `You are conversing with ${
		firstName ?? "a user"
	} who speaks at a ${assistant_language_level} language level.`;
	systemMessage += `You are a native speaker of the ${chatDialect} dialect and use words, phrases, greetings and expressions typical of the ${chatDialect} dialect. Speak as accurately as possible to the ${chatDialect} dialect.`;

	// detail level
	const detailLevelWordCount = {
		low: [20, 70],
		medium: [70, 120],
		high: [120, 160],
	};

	systemMessage += `Aim for between ${detailLevelWordCount[assistant_detail_level][0]} to ${detailLevelWordCount[assistant_detail_level][1]} words in your responses. `;
	systemMessage += `Output should be only the role-playing dialogue for ${chatPartner.name}, without including the speaker's name. Do not include any additional text, comments, or formatting. Ensure that tashkeel is included on every single letter to facilitate easier reading for the user, even on the final letter in a word.`;

	// interests
	// if (preferences.user_interests.length > 0) {
	// 	systemMessage += `Consider the user's interests such as ${user_interests.join(
	// 		", "
	// 	)} when choosing topics. `;
	// }

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
		model: "gpt-4o",
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
// 		model: "gpt-4o",
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
// 		model: "gpt-4o",
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
