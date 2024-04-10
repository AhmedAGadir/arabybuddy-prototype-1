import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { tmpdir } from "os";
import { ElevenLabsClient } from "elevenlabs";
import { streamToBase64 } from "@/lib/utils";
import { TextContentBlock } from "openai/resources/beta/threads/messages/messages.mjs";

// remember API calls wont work if the account balance is 0
const openai = new OpenAI({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY,
});

const elevenlabs = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request, res: Response) {
	try {
		// first transcript the incoming audio
		const {
			audio: { base64Audio, type },
			messages,
		} = await req.json();
		const { transcription } = await openAISpeechToText(base64Audio, type);

		// then pass it to the ArabyBuddy assistant to get a text response
		const { updatedMessages } = await openAIArabyBuddyAssistantConversation(
			messages,
			transcription
		);

		// // finally convert the response to audio
		// const { audio } = await elevenLabsTextToSpeech(
		// 	updatedMessages[updatedMessages.length - 1].content
		// );

		// const base64AudioResponse = await streamToBase64(audio);

		return Response.json(
			{
				messages: updatedMessages,
				// audioBase64: base64AudioResponse,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error processing audio:", error);
		return Response.error();
	}
}

const openAIArabyBuddyAssistantConversation = async (
	messages: { role: "user" | "assistant"; content: string }[],
	transcription: string
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
		content: transcription,
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

const openAISpeechToText = async (base64Audio: string, type: string) => {
	const audioData = Buffer.from(base64Audio, "base64");

	// https://github.com/orgs/vercel/discussions/241
	const dirPath = path.join(tmpdir(), "openai-audio-transcription");
	const filePath = path.join(dirPath, `input.${type}`);

	await fs.promises.mkdir(dirPath, { recursive: true });
	fs.writeFileSync(filePath, audioData);

	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(filePath),
		model: "whisper-1",
		language: "ar",
	});

	fs.unlinkSync(filePath);
	fs.rmSync(dirPath, { recursive: true, force: true });

	return { transcription: transcription.text };
};

const elevenLabsTextToSpeech = async (text: string) => {
	// list of available voices
	// elevenlabs.voices();

	// * mp3_22050_32 - output format, mp3 with 22.05kHz sample rate at 32kbps.
	// * mp3_44100_32 - output format, mp3 with 44.1kHz sample rate at 32kbps.
	// * mp3_44100_64 - output format, mp3 with 44.1kHz sample rate at 64kbps.
	// * mp3_44100_96 - output format, mp3 with 44.1kHz sample rate at 96kbps.
	// * mp3_44100_128 - default output format, mp3 with 44.1kHz sample rate at 128kbps.
	// * mp3_44100_192 - output format, mp3 with 44.1kHz sample rate at 192kbps. Requires you to be subscribed to Creator tier or above.
	// output_format:
	const voices = {
		rachel: { name: "Rachel", voiceId: "JOoOS0ygQqJknGa2C14N" },
		joey: {
			name: "Joey - Youthful and Energetic",
			voiceId: "bjL4GZJa40TcWjwdphFX",
		},
	};

	const audio = await elevenlabs.generate(
		{
			voice: voices.rachel.voiceId,
			text,
			model_id: "eleven_multilingual_v2",
			// output_format: "mp3_22050_32",
			// stream,
			// optimize_streaming_latency,
			// output_format,
			// pronunciation_dictionary_locators
			voice_settings: {
				stability: 0.5,
				similarity_boost: 0.75,
				style: 0,
				use_speaker_boost: true,
			},
		},

		{
			// timeoutInSeconds?: number;
			// maxRetries?: number;
		}
	);

	return { audio };
};
