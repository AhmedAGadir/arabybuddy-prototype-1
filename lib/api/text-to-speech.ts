import { ArabicDialect } from "@/types/types";
import { IPreferences } from "../database/models/preferences.model";
import { TextToSpeechPayload } from "@/app/api/chat/text-to-speech/route";
import { ChatPartnerId } from "../chatPartners";
// import { streamToBase64 } from "../utils";

type VoiceMap = {
	[C in ChatPartnerId]: string;
};

const voiceLibrary = {
	rachel: { name: "Rachel", voiceId: "JOoOS0ygQqJknGa2C14N" },
	faris: { name: "Faris", voiceId: "3wSw4sLrInDfXVdwlPRZ" },
	joey: {
		name: "Joey - Youthful and Energetic",
		voiceId: "bjL4GZJa40TcWjwdphFX",
	},
	mourad: { name: "Mourad", voiceId: "kERwN6X2cY8g1XbfzJsX" },
	sana: { name: "Sana", voiceId: "mRdG9GYEjJmIzqbYTidv" },
	noor: { name: "Noor", voiceId: "WFpAC00N91RVzSO3GG44" },
	wahab: { name: "Wahab Arabic", voiceId: "ldeGOUQJqLGjlVgYn7YL" },
	carla: {
		name: "Carla - young and energetic",
		voiceId: "1RCoDgfs0Ygdh1c5TPuW",
	},
	cowboy: {
		name: "Cowboy Bob // VF",
		voiceId: "KTPVrSVAEUSJRClDzBw7",
	},
	theo: {
		name: "Theo - Smart, warm, open",
		voiceId: "NyxenPOqNyllHIzSoPbJ",
	},
};

const voices: VoiceMap = {
	layla: voiceLibrary.rachel.voiceId,
	mustafa: voiceLibrary.theo.voiceId,
	"abu-khalid": voiceLibrary.mourad.voiceId,
	fatima: voiceLibrary.sana.voiceId,
	youssef: voiceLibrary.joey.voiceId,
	sofia: voiceLibrary.carla.voiceId,
	noura: voiceLibrary.noor.voiceId,
	juha: voiceLibrary.cowboy.voiceId,
	arabybuddy: voiceLibrary.joey.voiceId,
};

// were using a stream instead now so we can get timestamps for each word
export const elevenLabsTextToSpeechStream = async (
	payload: TextToSpeechPayload
) => {
	// list of available voices
	// elevenlabs.voices();

	// * mp3_22050_32 - output format, mp3 with 22.05kHz sample rate at 32kbps.
	// * mp3_44100_32 - output format, mp3 with 44.1kHz sample rate at 32kbps.
	// * mp3_44100_64 - output format, mp3 with 44.1kHz sample rate at 64kbps.
	// * mp3_44100_96 - output format, mp3 with 44.1kHz sample rate at 96kbps.
	// * mp3_44100_128 - default output format, mp3 with 44.1kHz sample rate at 128kbps.
	// * mp3_44100_192 - output format, mp3 with 44.1kHz sample rate at 192kbps. Requires you to be subscribed to Creator tier or above.
	// output_format:

	const {
		text,
		chat: { chatPartnerId, chatDialect },
		preferences: {
			voice_customization: {
				voice_stability,
				voice_similarity_boost,
				voice_style,
				voice_use_speaker_boost,
			},
		},
	} = payload;

	const voice = voices[chatPartnerId];

	const voice_settings = {
		stability: voice_stability,
		similarity_boost: voice_similarity_boost,
		style: voice_style,
		use_speaker_boost: voice_use_speaker_boost,
	};

	console.log("streaming text-to-speech...");

	const startTime = Date.now();

	const res = await fetch(
		`https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream/with-timestamps`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"xi-api-key": process.env.ELEVENLABS_API_KEY!,
			},
			body: JSON.stringify({
				model_id: "eleven_multilingual_v2",
				text,
				voice_settings,
			}),
		}
	);

	if (!res.ok) {
		throw new Error(`HTTP error status: ${res.status}`);
	}

	// ***** NEXTJS GUIDE ON STREAMING: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming

	async function* makeIterator() {
		for await (const chunk of res.body as any) {
			yield chunk;
		}
	}

	function iteratorToStream(iterator: any) {
		return new ReadableStream({
			async pull(controller) {
				const { value, done } = await iterator.next();

				if (done) {
					const duration = (Date.now() - startTime) / 1000;
					console.log(
						`[⌛ DURATION = ${duration}s] text-to-speech stream complete`
					);
					controller.close();
				} else {
					controller.enqueue(value);
				}
			},
		});
	}

	const iterator = makeIterator();
	const stream = iteratorToStream(iterator);

	return stream;
};

// // **** without streaming
// export const elevenLabsTextToSpeech = async ({
// 	elevenlabs,
// 	content,
// 	voice_customization: {
// 		arabic_dialect,
// 		assistant_gender,
// 		voice_similarity_boost,
// 		voice_stability,
// 		voice_style,
// 		voice_use_speaker_boost,
// 	},
// }: {
// 	elevenlabs: ElevenLabsClient;
// 	content: string;
// 	voice_customization: {
// 		arabic_dialect: IPreferences["arabic_dialect"];
// 		assistant_gender: IPreferences["assistant_gender"];
// 		voice_stability: IPreferences["voice_stability"];
// 		voice_similarity_boost: IPreferences["voice_similarity_boost"];
// 		voice_style: IPreferences["voice_style"];
// 		voice_use_speaker_boost: IPreferences["voice_use_speaker_boost"];
// 	};
// }) => {
// 	// list of available voices
// 	// elevenlabs.voices();

// 	// * mp3_22050_32 - output format, mp3 with 22.05kHz sample rate at 32kbps.
// 	// * mp3_44100_32 - output format, mp3 with 44.1kHz sample rate at 32kbps.
// 	// * mp3_44100_64 - output format, mp3 with 44.1kHz sample rate at 64kbps.
// 	// * mp3_44100_96 - output format, mp3 with 44.1kHz sample rate at 96kbps.
// 	// * mp3_44100_128 - default output format, mp3 with 44.1kHz sample rate at 128kbps.
// 	// * mp3_44100_192 - output format, mp3 with 44.1kHz sample rate at 192kbps. Requires you to be subscribed to Creator tier or above.
// 	// output_format:

// 	const voice = voices[arabic_dialect][assistant_gender].voiceId;

// 	const voice_settings = {
// 		stability: voice_stability,
// 		similarity_boost: voice_similarity_boost,
// 		style: voice_style,
// 		use_speaker_boost: voice_use_speaker_boost,
// 	};

// 	console.log(
// 		"sending text to elevenlabs...",
// 		"voice",
// 		voice,
// 		"voice_settings",
// 		voice_settings
// 	);

// 	const startTime = Date.now();

// 	const audio = await elevenlabs.generate(
// 		{
// 			model_id: "eleven_multilingual_v2",
// 			voice,
// 			voice_settings,
// 			text: content,
// 			// stream: true,
// 			// output_format: "mp3_22050_32",
// 			// stream,
// 			// optimize_streaming_latency,
// 			// output_format,
// 			// pronunciation_dictionary_locators
// 		},

// 		{
// 			// timeoutInSeconds?: number;
// 			// maxRetries?: number;
// 		}
// 	);

// 	const duration = (Date.now() - startTime) / 1000;

// 	console.log(`[⌛ DURATION = ${duration}s] text to speech complete`);

// 	const base64Audio = await streamToBase64(audio);

// 	return { base64Audio };
// };
