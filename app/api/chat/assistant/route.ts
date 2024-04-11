import { ChatMessage } from "@/app/(root)/chat/page";
import OpenAI from "openai";
import { TextContentBlock } from "openai/resources/beta/threads/messages/messages.mjs";

// remember API calls wont work if the account balance is 0
const openai = new OpenAI({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
	try {
		const { chatHistory, latestChatMessage } = await req.json();

		const { updatedChatHistory } = await openAIAddChatMessageAndAwaitResponse(
			chatHistory,
			latestChatMessage
		);

		return Response.json(
			{
				chatHistory: updatedChatHistory,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error connection to OpenAI Asssistant API", error);
		return Response.error();
	}
}

const openAIAddChatMessageAndAwaitResponse = async (
	chatHistory: ChatMessage[],
	latestChatMessage: ChatMessage
) => {
	// create the assistant
	console.log("Creating assistant");
	const assistant = await openai.beta.assistants.create({
		name: "ArabyBuddy",
		instructions:
			"You are a friendly Arabic language tutor who the user is here to conversate with. Your name is 'ArabyBuddy' and you offer nice topics of conversation",
		model: "gpt-4-turbo-preview",
	});

	console.log("Adding chat history to thread", chatHistory);
	// create the thread and pass all previous messages
	const thread = await openai.beta.threads.create({
		messages: chatHistory,
	});

	console.log("adding latest chat message to thread", latestChatMessage);
	// add transcription to thread
	await openai.beta.threads.messages.create(thread.id, latestChatMessage);

	console.log("polling....");
	// run the thread with the assistant
	const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
		assistant_id: assistant.id,
		//   instructions: "Please address the user as Jane Doe. The user has a premium account."
		// instructions: "Respond to the user.",
	});

	console.log("run.status", run.status);
	let updatedChatHistory = [];

	if (run.status === "completed") {
		const messagesPage: OpenAI.Beta.Threads.Messages.MessagesPage =
			await openai.beta.threads.messages.list(run.thread_id);

		updatedChatHistory = messagesPage.data.reverse().map((message) => ({
			role: message.role,
			content: (message.content[0] as TextContentBlock).text.value,
		}));
		console.log("updatedChatHistory", updatedChatHistory);
	} else {
		throw new Error("Thread run either failed or is not completed");
	}

	return { updatedChatHistory };
};
