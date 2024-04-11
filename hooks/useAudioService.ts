import { blobToBase64, makeServerlessRequest } from "@/lib/utils";
import { useCallback } from "react";
import { useLogger } from "./useLogger";

const useAudioService = () => {
	const logger = useLogger({ label: "AudioService", color: "#87de74" });

	const speechToText = useCallback(
		async (audioBlob: Blob) => {
			const base64Audio = await blobToBase64(audioBlob);

			logger.log("making request to: /api/chat/speech-to-text...");
			const { transcription } = await makeServerlessRequest(
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
		},
		[logger]
	);

	const textToSpeech = useCallback(
		async (content: string) => {
			logger.log("making request to: /api/chat/text-to-speech...");

			const { base64Audio } = await makeServerlessRequest(
				"/api/chat/text-to-speech",
				{
					content,
				}
			);

			logger.log("base64Audio", `${base64Audio.slice(0, 10)}...`);

			return { base64Audio };
		},
		[logger]
	);

	return { speechToText, textToSpeech };
};

export { useAudioService };
