import { blobToBase64 } from "@/lib/utils";
import { useCallback } from "react";
import { useLogger } from "./useLogger";
import { useServerlessRequest } from "./useServerlessRequest";
import { usePreferences } from "./usePreferences";
import { DEFAULT_USER_PREFERENCES } from "@/lib/database/models/preferences.model";

const useAudioService = () => {
	const logger = useLogger({ label: "AudioService", color: "#87de74" });

	const {
		makeServerlessRequest: makeServerlessRequestSpeechToText,
		abortRequest: abortSpeechToTextRequest,
	} = useServerlessRequest();

	const { preferences } = usePreferences();

	const speechToText = useCallback(
		async (audioBlob: Blob) => {
			try {
				const base64Audio = await blobToBase64(audioBlob);
				const params = {
					audio: {
						base64Audio,
						type: audioBlob.type.split("/")[1],
						// TODO: add dialect support for transcription
					},
				};

				logger.log("making request to: /api/chat/speech-to-text...", params);
				const res = await makeServerlessRequestSpeechToText(
					"/api/chat/speech-to-text",
					{ ...params }
				);

				const data = await res.json();

				if (res.status !== 200) {
					throw (
						data.error || new Error(`Request failed with status ${res.status}`)
					);
				}

				const { transcription } = data;

				logger.log("transcription", transcription);

				return { transcription };
			} catch (error) {
				logger.error("Failed to convert speech to text", error);
				throw error;
			}
		},
		[logger, makeServerlessRequestSpeechToText]
	);

	const {
		makeServerlessRequest: makeServerlessRequestTextToSpeech,
		abortRequest: abortTextToSpeechRequest,
	} = useServerlessRequest();

	const textToSpeech = useCallback(
		async (content: string) => {
			try {
				const params = {
					content,
					voice_customization: {
						arabic_dialect:
							preferences.arabic_dialect ??
							DEFAULT_USER_PREFERENCES.arabic_dialect,
						assistant_gender:
							preferences.assistant_gender ??
							DEFAULT_USER_PREFERENCES.assistant_gender,
						voice_stability:
							preferences.voice_stability ??
							DEFAULT_USER_PREFERENCES.voice_stability,
						voice_similarity_boost:
							preferences.voice_similarity_boost ??
							DEFAULT_USER_PREFERENCES.voice_similarity_boost,
						voice_style:
							preferences.voice_style ?? DEFAULT_USER_PREFERENCES.voice_style,
						voice_use_speaker_boost:
							preferences.voice_use_speaker_boost ??
							DEFAULT_USER_PREFERENCES.voice_use_speaker_boost,
					},
				};

				logger.log("making request to: /api/chat/text-to-speech...", params);

				const res = await makeServerlessRequestTextToSpeech(
					"/api/chat/text-to-speech",
					{ ...params }
				);

				if (!res.ok) {
					throw new Error(`HTTP error status: ${res.status}`);
				}

				const decoder = new TextDecoder();

				for await (const chunk of res.body as any) {
					const decodedChunk = decoder.decode(chunk, { stream: true });
					console.log("decodedChunk", decodedChunk);
				}

				throw new Error("Not implemented");

				// return { base64Audio };
			} catch (error) {
				logger.error("Failed to convert text to speech", error);
				throw error;
			}
		},
		[logger, makeServerlessRequestTextToSpeech, preferences]
	);

	return {
		speechToText,
		textToSpeech,
		abortSpeechToTextRequest,
		abortTextToSpeechRequest,
	};
};

export { useAudioService };
