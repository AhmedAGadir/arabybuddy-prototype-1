import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { tmpdir } from "os";
import { ElevenLabsClient } from "elevenlabs";
import internal from "stream";

// remember API calls wont work if the account balance is 0
const openai = new OpenAI({
	organization: process.env.OPENAI_ORG_ID,
	apiKey: process.env.OPENAI_API_KEY,
});

const elevenlabs = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY,
});

async function streamToBase64(readableStream: internal.Stream) {
	return new Promise((resolve, reject) => {
		const chunks: any[] = [];
		readableStream.on("data", (chunk) => chunks.push(chunk));
		readableStream.on("error", reject);
		readableStream.on("end", () => {
			const buffer = Buffer.concat(chunks);
			const base64 = buffer.toString("base64");
			resolve(base64);
		});
	});
}

export async function POST(req: Request, res: Response) {
	try {
		// first transcript the incoming audio
		const { base64Audio, type } = await req.json();
		const { transcription } = await openAISpeechToText(base64Audio, type);

		// generate new audio from the text transcription (TODO: change)

		const { audio } = await elevenLabsTextToSpeech(transcription);

		const base64AudioResponse = await streamToBase64(audio);

		// convert mp3 to base64 blob
		// const audioBlob = await audio.arrayBuffer();
		// const base64AudioResponse = Buffer.from(audioBlob).toString("base64");

		return Response.json(
			{ text: transcription, audioBase64: base64AudioResponse },
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

	console.log("audio", audio);

	return { audio };
};
