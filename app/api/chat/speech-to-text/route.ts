import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

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

		const {
			audio: { base64Audio, type },
		} = await req.json();

		const startTime = Date.now();

		const { transcription } = await openAISpeechToText(base64Audio, type);

		const duration = (Date.now() - startTime) / 1000;

		console.log(
			`[⌛ DURATION = ${duration}s] transcription complete`,
			transcription
		);

		return Response.json(
			{
				transcription,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error converting speech to text:", error);
		return Response.error();
	}
}

const openAISpeechToText = async (base64Audio: string, type: string) => {
	const audioData = Buffer.from(base64Audio, "base64");

	// create a temporary directory to store the audio file
	// https://github.com/orgs/vercel/discussions/241
	const dirPath = path.join(tmpdir(), "openai-audio-transcription");
	const filePath = path.join(dirPath, `input.${type}`);
	console.log("tmp dir created at ", dirPath, "file path in tmp dir", filePath);

	// write the audio data to a file
	console.log("writing user audio data to file");
	await fs.promises.mkdir(dirPath, { recursive: true });
	fs.writeFileSync(filePath, audioData);

	// transcribe the audio file
	console.log("openAI transcribing audio file");
	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(filePath),
		model: "whisper-1",
		language: "ar",
	});

	// remove tmp files
	console.log("removing tmp files");
	fs.unlinkSync(filePath);
	fs.rmSync(dirPath, { recursive: true, force: true });

	return { transcription: transcription.text };
};
