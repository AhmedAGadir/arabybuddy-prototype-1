import { blobToBase64 } from "@/lib/utils";
import { useCallback } from "react";
import { useLogger } from "./useLogger";
import { useServerlessRequest } from "./useServerlessRequest";

const useAudioService = () => {
	const logger = useLogger({ label: "AudioService", color: "#87de74" });

	const {
		makeServerlessRequest: makeServerlessRequestSpeechToText,
		abortRequest: abortSpeechToTextRequest,
	} = useServerlessRequest();

	const speechToText = useCallback(
		async (audioBlob: Blob) => {
			try {
				const base64Audio = await blobToBase64(audioBlob);

				logger.log("making request to: /api/chat/speech-to-text...");
				const { transcription } = await makeServerlessRequestSpeechToText(
					"/api/chat/speech-to-text",
					{
						audio: {
							base64Audio,
							type: audioBlob.type.split("/")[1],
						},
					}
				);

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
				logger.log("making request to: /api/chat/text-to-speech...");

				const { base64Audio } = await makeServerlessRequestTextToSpeech(
					"/api/chat/text-to-speech",
					{
						content,
					}
				);

				logger.log("base64Audio", `${base64Audio.slice(0, 10)}...`);

				return { base64Audio };
			} catch (error) {
				logger.error("Failed to convert text to speech", error);
				throw error;
			}
		},
		[logger, makeServerlessRequestTextToSpeech]
	);

	return {
		speechToText,
		textToSpeech,
		abortSpeechToTextRequest,
		abortTextToSpeechRequest,
	};
};

export { useAudioService };
