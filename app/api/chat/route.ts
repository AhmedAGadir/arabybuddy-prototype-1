import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { tmpdir } from "os";
import { ElevenLabsClient } from "elevenlabs";
import { streamToBase64 } from "@/lib/utils";

// remember API calls wont work if the account balance is 0
const openai = new OpenAI({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY,
});

const elevenlabs = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY,
});

// writing object oriented code because why not its my project i can do what I want
class Assistant {
	name: string;
	instructions: string;
	assistant: OpenAI.Beta.Assistants.Assistant | undefined;
	thread: OpenAI.Beta.Threads.Thread | undefined;

	constructor({ name, instructions }: { name: string; instructions: string }) {
		this.name = name;
		this.instructions = instructions;

		this.init = this.init.bind(this);
		this.addMessageToThread = this.addMessageToThread.bind(this);
	}

	async init() {
		this.assistant = await openai.beta.assistants.create({
			name: this.name,
			instructions: this.instructions,
			model: "gpt-4-turbo-preview",
		});
		this.thread = await openai.beta.threads.create();
	}

	async addMessageToThread(message: string): Promise<{ message: string }> {
		if (!this.assistant || !this.thread) {
			throw new Error("Assistance not initialized correctly");
		}
		// add message to thread
		await openai.beta.threads.messages.create(this.thread.id, {
			role: "user",
			content: message,
		});

		// run the thread with the assistant
		const run = await openai.beta.threads.runs.createAndPoll(this.thread.id, {
			assistant_id: this.assistant.id,
			//   instructions: "Please address the user as Jane Doe. The user has a premium account."
			instructions: "Respond to the user.",
		});

		if (run.status === "completed") {
			const messages = await openai.beta.threads.messages.list(run.thread_id);
			const latestMessage = messages.data[0].content[0];

			return {
				message: latestMessage.type === "text" ? latestMessage.text.value : "",
			};
		} else {
			throw new Error("Thread run either failed or is not completed");
		}
	}
}

let arabyBuddyAssistant: Assistant;

export async function POST(req: Request, res: Response) {
	try {
		if (!arabyBuddyAssistant) {
			const arabyBuddyConfig = {
				name: "ArabyBuddy",
				instructions:
					"You are a friendly Arabic language tutor, conversate with me.",
			};
			console.log("Initializing ArabyBuddy assistant...");
			arabyBuddyAssistant = new Assistant(arabyBuddyConfig);
			await arabyBuddyAssistant.init();
		}
		// first transcript the incoming audio
		const { base64Audio, type } = await req.json();
		const { transcription } = await openAISpeechToText(base64Audio, type);

		const { message: assistantResponseMessage } =
			await arabyBuddyAssistant.addMessageToThread(transcription);

		const { audio } = await elevenLabsTextToSpeech(assistantResponseMessage);

		const base64AudioResponse = await streamToBase64(audio);

		return Response.json(
			{ text: assistantResponseMessage, audioBase64: base64AudioResponse },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error processing audio:", error);
		return Response.error();
	}
}

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
