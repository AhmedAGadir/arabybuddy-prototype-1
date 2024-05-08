import { ElevenLabsClient } from "elevenlabs";
import { streamToBase64 } from "@/lib/utils";
import { IPreferences } from "@/lib/database/models/preferences.model";
import { ArabicDialect } from "@/types/types";
import { auth } from "@clerk/nextjs/server";

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

		const { audio } = await elevenLabsTextToSpeech({
			content,
			voice_customization,
		});

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

const elevenLabsTextToSpeech = async ({
	content,
	voice_customization: {
		arabic_dialect,
		assistant_gender,
		voice_similarity_boost,
		voice_stability,
		voice_style,
		voice_use_speaker_boost,
	},
}: {
	content: string;
	voice_customization: {
		arabic_dialect: IPreferences["arabic_dialect"];
		assistant_gender: IPreferences["assistant_gender"];
		voice_stability: IPreferences["voice_stability"];
		voice_similarity_boost: IPreferences["voice_similarity_boost"];
		voice_style: IPreferences["voice_style"];
		voice_use_speaker_boost: IPreferences["voice_use_speaker_boost"];
	};
}) => {
	// list of available voices
	// elevenlabs.voices();

	// * mp3_22050_32 - output format, mp3 with 22.05kHz sample rate at 32kbps.
	// * mp3_44100_32 - output format, mp3 with 44.1kHz sample rate at 32kbps.
	// * mp3_44100_64 - output format, mp3 with 44.1kHz sample rate at 64kbps.
	// * mp3_44100_96 - output format, mp3 with 44.1kHz sample rate at 96kbps.
	// * mp3_44100_128 - default output format, mp3 with 44.1kHz sample rate at 128kbps.
	// * mp3_44100_192 - output format, mp3 with 44.1kHz sample rate at 192kbps. Requires you to be subscribed to Creator tier or above.
	// output_format:

	type AssistantGender = IPreferences["assistant_gender"];

	type VoiceMap = {
		[D in ArabicDialect]: {
			[K in AssistantGender]: { name: string; voiceId: string };
		};
	};

	// TODO: add voice support for other dialects
	const voiceLibrary = {
		rachel: { name: "Rachel", voiceId: "JOoOS0ygQqJknGa2C14N" },
		joey: {
			name: "Joey - Youthful and Energetic",
			voiceId: "bjL4GZJa40TcWjwdphFX",
		},
		mourad: { name: "Mourad", voiceId: "kERwN6X2cY8g1XbfzJsX" },
		sana: { name: "Sana", voiceId: "mRdG9GYEjJmIzqbYTidv" },
	};

	const voices: VoiceMap = {
		"Modern Standard Arabic": {
			young_female: voiceLibrary.rachel,
			young_male: voiceLibrary.joey,
			old_male: voiceLibrary.mourad,
			old_female: voiceLibrary.sana,
		},
		Egyptian: {
			young_female: voiceLibrary.rachel,
			young_male: voiceLibrary.joey,
			old_male: voiceLibrary.mourad,
			old_female: voiceLibrary.sana,
		},
		Levantine: {
			young_female: voiceLibrary.rachel,
			young_male: voiceLibrary.joey,
			old_male: voiceLibrary.mourad,
			old_female: voiceLibrary.sana,
		},
		Gulf: {
			young_female: voiceLibrary.rachel,
			young_male: voiceLibrary.joey,
			old_male: voiceLibrary.mourad,
			old_female: voiceLibrary.sana,
		},
		Maghrebi: {
			young_female: voiceLibrary.rachel,
			young_male: voiceLibrary.joey,
			old_male: voiceLibrary.mourad,
			old_female: voiceLibrary.sana,
		},
		Sudanese: {
			young_female: voiceLibrary.rachel,
			young_male: voiceLibrary.joey,
			old_male: voiceLibrary.mourad,
			old_female: voiceLibrary.sana,
		},
		Iraqi: {
			young_female: voiceLibrary.rachel,
			young_male: voiceLibrary.joey,
			old_male: voiceLibrary.mourad,
			old_female: voiceLibrary.sana,
		},
		Yemeni: {
			young_female: voiceLibrary.rachel,
			young_male: voiceLibrary.joey,
			old_male: voiceLibrary.mourad,
			old_female: voiceLibrary.sana,
		},
	};

	const voice = voices[arabic_dialect][assistant_gender].voiceId;

	const voice_settings = {
		stability: voice_stability,
		similarity_boost: voice_similarity_boost,
		style: voice_style,
		use_speaker_boost: voice_use_speaker_boost,
	};

	console.log(
		"sending text to elevenlabs...",
		"voice",
		voice,
		"voice_settings",
		voice_settings
	);

	const audio = await elevenlabs.generate(
		{
			model_id: "eleven_multilingual_v2",
			voice,
			voice_settings,
			text: content,
			// output_format: "mp3_22050_32",
			// // TODO: add streaming
			// stream,
			// optimize_streaming_latency,
			// output_format,
			// pronunciation_dictionary_locators
		},

		{
			// timeoutInSeconds?: number;
			// maxRetries?: number;
		}
	);

	console.log("audio received from elevenlabs");

	return { audio };
};
