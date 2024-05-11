import { ElevenLabsClient } from "elevenlabs";
import { auth } from "@clerk/nextjs/server";
import { elevenLabsTextToSpeech } from "@/lib/api/text-to-speech";

// export const runtime = "edge";

// for every 1000 characters above your usage, they charge you $0.30
const elevenlabs = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request, res: Response) {
	try {
		const { userId } = auth();

		if (!userId) {
			throw new Error("User not authenticated");
		}

		const { content, voice_customization } = await req.json();

		const stream = await elevenLabsTextToSpeech({
			content,
			voice_customization,
			elevenlabs,
		});

		return new Response(stream);
	} catch (error) {
		console.error("Error converting text to speech:", error);
		return Response.error();
	}
}
