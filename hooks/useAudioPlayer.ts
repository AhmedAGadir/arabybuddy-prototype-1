import { base64ToBlob } from "@/lib/utils";
import { useState, useRef } from "react";
import { useLogger } from "./useLogger";
import { set } from "lodash";

const useAudioPlayer = () => {
	const logger = useLogger({ label: "useAudioPlayer", color: "#b98eff" });

	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);

	const audioRef = useRef<HTMLAudioElement>();
	const audioSrcRef = useRef<string | null>(null);

	const updateDuration = () => {
		if (!audioRef.current) return;
		// duration to 1 decimal place
		const duration = Math.floor(audioRef.current.duration * 10) / 10;
		setDuration(duration);
	};

	const updateCurrentTime = () => {
		if (!audioRef.current) return;
		// currentTime to 1 decimal place
		const currentTime = Math.floor(audioRef.current.currentTime * 10) / 10;
		setCurrentTime(currentTime);
	};

	const playAudio = async (base64Audio: string) => {
		const audioBlob = base64ToBlob(base64Audio, "audio/mp3");
		const audioSrc = URL.createObjectURL(audioBlob);
		audioSrcRef.current = audioSrc;

		if (!audioRef.current) {
			throw new Error("Audio element not initialized");
		}

		audioRef.current.src = audioSrc;

		// const originalVolume = audioRef.current.volume;

		// audioRef.current.muted = true;
		// audioRef.current.autoplay = true;

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
				audioRef.current?.removeEventListener("loadedmetadata", updateDuration);
				audioRef.current?.removeEventListener("timeupdate", updateCurrentTime);
				setCurrentTime(0);
				setDuration(0);

				resolve();
			};

			audioRef.current.addEventListener("ended", onAudioEnded);
			audioRef.current.addEventListener("loadedmetadata", updateDuration);
			audioRef.current.addEventListener("timeupdate", updateCurrentTime);

			try {
				logger.log("Playing audio");
				await audioRef.current.play();

				// audioRef.current.volume = originalVolume;
				// audioRef.current.muted = false;
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

	const stopPlaying = () => {
		if (!audioRef.current) {
			logger.log("Audio element not initialized");
			return;
		}

		logger.log("Stopping audio playback");
		audioRef.current.pause();
		audioRef.current.currentTime = 0;
		// setIsPlaying(false);
		// Manually trigger the 'ended' event
		const endedEvent = new Event("ended");
		audioRef.current.dispatchEvent(endedEvent);
	};

	const pausePlaying = () => {
		if (!audioRef.current) {
			logger.log("Audio element not initialized");
			return;
		}

		logger.log("Pausing audio playback");
		audioRef.current.pause();
		setIsPlaying(false);
	};

	const audioElementInitialized = audioRef.current !== undefined;

	return {
		playAudio,
		isPlaying,
		initAudioElement,
		audioElementInitialized,
		stopPlaying,
		pausePlaying,
		duration,
		currentTime,
	};
};

export { useAudioPlayer };
