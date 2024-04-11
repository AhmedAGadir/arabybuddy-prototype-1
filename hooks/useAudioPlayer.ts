import { base64ToBlob } from "@/lib/utils";
import { useState, useRef } from "react";
import { useLogger } from "./useLogger";

const useAudioPlayer = () => {
	const logger = useLogger({ label: "useAudioPlayer", color: "#b98eff" });

	const [isPlaying, setIsPlaying] = useState(false);

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

		// using a promise so that the caller can await the audio playback
		const promise = new Promise<void>(async (resolve, reject) => {
			if (!audioRef.current) {
				reject(new Error("Audio element not initialized"));
				return;
			}

			const onAudioEnded = () => {
				setIsPlaying(false);
				logger.log("Audio ended");
				URL.revokeObjectURL(audioSrcRef.current ?? "");
				audioSrcRef.current = null;
				audioRef.current?.removeEventListener("ended", onAudioEnded);
				resolve();
			};

			audioRef.current.addEventListener("ended", onAudioEnded);

			try {
				logger.log("Playing audio");
				await audioRef.current.play();

				audioRef.current.volume = originalVolume;
				audioRef.current.muted = false;
			} catch (err) {
				reject(new Error("Failed to play audio"));
			}
		});

		return promise;
	};

	const initAudioElement = () => {
		if (audioRef.current) {
			logger.log("Audio element already initialized");
			return;
		}
		logger.log("Initializing audio element...");

		const audio = new Audio();

		audioRef.current = audio;
	};

	return { playAudio, isPlaying, initAudioElement };
};

export { useAudioPlayer };
