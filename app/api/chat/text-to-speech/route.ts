import { auth } from "@clerk/nextjs/server";
import { elevenLabsTextToSpeechStream } from "@/lib/api/text-to-speech";

// export const runtime = "edge";

export async function POST(req: Request, res: Response) {
	try {
		auth().protect();

		const { content, voice_customization } = await req.json();

		const stream = await elevenLabsTextToSpeechStream({
			text: content,
			voice_customization,
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error converting text to speech:", error);
		return Response.error();
	}
}
