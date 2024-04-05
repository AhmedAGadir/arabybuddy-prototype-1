import { useCallback, useEffect, useRef, useState } from "react";
import { useSilenceDetection } from "./useSilenceDetection";
import { useSound } from "./useSound";
import { usePolyfill } from "./useMediaRecorderPolyfil";

const useRecording = (onRecordingComplete?: (blob: Blob) => void) => {
	const [isRecording, setIsRecording] = useState(false);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	// const { getMediaRecorder } = usePolyfill();
	const streamRef = useRef<MediaStream>();
	const chunksRef = useRef<Blob[]>([]);

	const { detectSilence, amplitude, stopSilenceDetection } =
		useSilenceDetection();

	const startSound = useSound("/assets/sounds/start.mp3");
	const stopSound = useSound("/assets/sounds/stop.mp3");

	useEffect(() => {
		const requestPermission = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				streamRef.current = stream;
			} catch (err) {
				console.error("Failed to get user media", err);
			}
		};

		requestPermission();
	}, []);

	const stopRecording = useCallback(() => {
		setIsRecording(false);
		mediaRecorderRef.current?.stop();
		stopSilenceDetection();

		stopSound?.play();
	}, [stopSilenceDetection, stopSound]);

	const startRecording = useCallback(() => {
		if (!streamRef.current) return;

		startSound?.play();
		setIsRecording(true);

		mediaRecorderRef.current = new MediaRecorder(streamRef.current);
		mediaRecorderRef.current.start();

		mediaRecorderRef.current.ondataavailable = (e) => {
			chunksRef.current.push(e.data);
		};

		mediaRecorderRef.current.onstop = (e) => {
			const blob = new Blob(chunksRef.current, { type: "audio/mp4" });
			onRecordingComplete?.(blob);
			chunksRef.current = [];

			if (mediaRecorderRef.current) {
				mediaRecorderRef.current.ondataavailable = null;
				mediaRecorderRef.current.onstop = null;
				mediaRecorderRef.current = null;
			}
		};

		detectSilence(mediaRecorderRef.current, 3000, stopRecording);
	}, [detectSilence, onRecordingComplete, startSound, stopRecording]);

	return {
		isRecording,
		startRecording,
		stopRecording,
		amplitude,
	};
};

export { useRecording };
