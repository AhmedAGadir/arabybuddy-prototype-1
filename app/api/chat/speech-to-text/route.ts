import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { tmpdir } from "os";

// remember API calls wont work if the account balance is 0
const openai = new OpenAI({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
	try {
		const { base64Audio, type } = await req.json();
		const { transcription } = await openAISpeechToText(base64Audio, type);
		return Response.json({ result: transcription }, { status: 200 });
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
	});

	fs.unlinkSync(filePath);
	fs.rmSync(dirPath, { recursive: true, force: true });

	return { transcription: transcription.text };
};
