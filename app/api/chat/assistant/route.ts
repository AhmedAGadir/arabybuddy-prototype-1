import OpenAI from "openai";
import { TextContentBlock } from "openai/resources/beta/threads/messages/messages.mjs";

// remember API calls wont work if the account balance is 0
const openai = new OpenAI({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
	try {
		const { messages, content } = await req.json();

		const { updatedMessages } =
			await openAiAppendUserMessageAndAwaitAssistantResponse(messages, content);

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

const openAiAppendUserMessageAndAwaitAssistantResponse = async (
	messages: { role: "user" | "assistant"; content: string }[],
	content: string
) => {
	// create the assistant
	const assistant = await openai.beta.assistants.create({
		name: "ArabyBuddy",
		instructions:
			"You are a friendly Arabic language tutor, conversate with me.",
		model: "gpt-4-turbo-preview",
	});

	// create the thread and pass all previous messages
	const thread = await openai.beta.threads.create({
		messages,
	});

	// add transcription to thread
	await openai.beta.threads.messages.create(thread.id, {
		role: "user",
		content,
	});

	// run the thread with the assistant
	const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
		assistant_id: assistant.id,
		//   instructions: "Please address the user as Jane Doe. The user has a premium account."
		instructions: "Respond to the user.",
	});

	let updatedMessages = [];

	if (run.status === "completed") {
		const messagesPage: OpenAI.Beta.Threads.Messages.MessagesPage =
			await openai.beta.threads.messages.list(run.thread_id);

		updatedMessages = messagesPage.data.reverse().map((message) => ({
			role: message.role,
			content: (message.content[0] as TextContentBlock).text.value,
		}));
	} else {
		throw new Error("Thread run either failed or is not completed");
	}

	return { updatedMessages };
};
