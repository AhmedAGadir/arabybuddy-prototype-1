import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
	organization: "org-B14Y5vkrVXQspVLJnhcfWvqD",
	apiKey: process.env.OPENAI_API_KEY,
});

// export async function POST(req: Request, res: Response) {
// 	try {
// 		const transcription = await openai.audio.transcriptions.create({
// 			file: fs.createReadStream("public/assets/sounds/test-user-audio.mp3"),
// 			model: "whisper-1",
// 			response_format: "text",
// 		});

// 		console.log(transcription);

// 		return Response.json({ result: transcription.text });
// 	} catch (error) {
// 		console.error("Error processing audio:", error);
// 		return Response.error();
// 	}
// }

export async function POST(req: Request, res: Response) {
	try {
		// Parse the request body and extract the audio data
		const { base64Audio, type } = await req.json();

		const { transcription } = await openAISpeechToText(base64Audio, type);

		return Response.json({ result: transcription }, { status: 200 });
	} catch (error) {
		console.error("Error processing audio:", error);
		return Response.error();
	}
}

const openAISpeechToText = async (base64Audio: string, type: string) => {
	// Convert the Base64 audio data back to a Buffer
	const audioData = Buffer.from(base64Audio, "base64");

	// Write the audio data to a temporary file
	const dirPath = "./tmp";
	const filePath = path.join(dirPath, `input.${type}`);
	// Ensure the directory exists
	await fs.promises.mkdir(dirPath, { recursive: true });
	// Write the file
	fs.writeFileSync(filePath, audioData);

	// console.log("readStream", readStream);

	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(filePath),
		model: "whisper-1",
	});

	// Remove the file after use
	fs.unlinkSync(filePath);
	// remove the tmp directory
	fs.rmdirSync(dirPath);

	return { transcription: transcription.text };
};
