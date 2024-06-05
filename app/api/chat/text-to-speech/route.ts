import { auth } from "@clerk/nextjs/server";
import { elevenLabsTextToSpeechStream } from "@/lib/api/text-to-speech";
import { ArabicDialect } from "@/types/types";
import { IPreferences } from "@/lib/database/models/preferences.model";
import { ChatPartnerId } from "@/lib/chatPartners";

// export const runtime = "edge";

export type TextToSpeechPayload = {
	text: string;
	chat: {
		chatPartnerId: ChatPartnerId;
		chatDialect: ArabicDialect;
	};
	preferences: {
		voice_customization: {
			voice_stability: IPreferences["voice_stability"];
			voice_similarity_boost: IPreferences["voice_similarity_boost"];
			voice_style: IPreferences["voice_style"];
			voice_use_speaker_boost: IPreferences["voice_use_speaker_boost"];
		};
	};
};

export async function POST(req: Request, res: Response) {
	try {
		auth().protect();

		const payload: TextToSpeechPayload = await req.json();

		console.log(`payload: ${payload}`);

		const stream = await elevenLabsTextToSpeechStream(payload);

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
