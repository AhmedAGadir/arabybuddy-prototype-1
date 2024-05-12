import { ElevenLabsClient } from "elevenlabs";
import { auth } from "@clerk/nextjs/server";
import { elevenLabsTextToSpeech } from "@/lib/api/text-to-speech";
import { streamToBase64 } from "@/lib/utils";

// export const runtime = "edge";

// for every 1000 characters above your usage, they charge you $0.30
const elevenlabs = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request, res: Response) {
	try {
		auth().protect();

		const { content, voice_customization } = await req.json();

		const { base64Audio } = await elevenLabsTextToSpeech({
			content,
			voice_customization,
			elevenlabs,
		});

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
