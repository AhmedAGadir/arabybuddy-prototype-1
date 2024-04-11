import { ElevenLabsClient } from "elevenlabs";
import { streamToBase64 } from "@/lib/utils";

const elevenlabs = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request, res: Response) {
	try {
		const { content } = await req.json();

		const { audio } = await elevenLabsTextToSpeech(content);

		const base64Audio = await streamToBase64(audio);

		return Response.json(
			{
				base64Audio,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error converting text to speech:", error);
		return Response.error();
	}
}

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
			voice: voices.joey.voiceId,
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

// const ffmpeg = require("fluent-ffmpeg");

// function convertMp3ToMp4(inputPath, outputPath) {
// 	return new Promise((resolve, reject) => {
// 		ffmpeg(inputPath)
// 			.output(outputPath)
// 			.on("end", () => resolve())
// 			.on("error", (err) => reject(err))
// 			.run();
// 	});
// }

// // Example usage
// const inputPath = "path/to/input.mp3";
// const outputPath = "path/to/output.mp4";

// convertMp3ToMp4(inputPath, outputPath)
// 	.then(() => console.log("Conversion successful"))
// 	.catch((err) => console.error("Conversion failed:", err));
