import { base64ToBlob, blobToBase64, makeServerlessRequest } from "@/lib/utils";
import { useCallback, useState, useRef } from "react";
import { useLogger } from "./useLogger";
import { set } from "lodash";

const useAudioService = () => {
	const logger = useLogger({ label: "AudioService", color: "#b98eff" });

	const [isPlaying, setIsPlaying] = useState(false);

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

	const audioRef = useRef<HTMLAudioElement>();
	const audioSrcRef = useRef<string | null>(null);

	const playAudio = async (base64Audio: string) => {
		const audioBlob = base64ToBlob(base64Audio, "audio/mp3");
		const audioSrc = URL.createObjectURL(audioBlob);
		audioSrcRef.current = audioSrc;

		if (!audioRef.current) {
			throw new Error("Audio element not initialized");
		}

		audioRef.current.src = audioSrc;

		const originalVolume = audioRef.current.volume;

		audioRef.current.muted = true;
		audioRef.current.autoplay = true;

		setIsPlaying(true);

		try {
			await audioRef.current.play();

			audioRef.current.volume = originalVolume;

			audioRef.current.muted = false;
		} catch (err) {
			throw new Error("Failed to play audio");
		}
	};

	const onAudioEnded = () => {
		setIsPlaying(false);
		URL.revokeObjectURL(audioSrcRef.current ?? "");
		audioSrcRef.current = null;
	};

	const initAudioElement = () => {
		if (audioRef.current) {
			logger.log("Audio element already initialized");
			return;
		}
		logger.log("Initializing audio element...");

		const audio = new Audio();

		audio.addEventListener("ended", onAudioEnded);

		audioRef.current = audio;
	};

	return { speechToText, textToSpeech, playAudio, isPlaying, initAudioElement };
};

export { useAudioService };
