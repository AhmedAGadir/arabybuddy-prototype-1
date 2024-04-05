import { useCallback, useEffect, useRef, useState } from "react";
import { useSilenceDetection } from "./useSilenceDetection";
import { useSound } from "./useSound";
// import { usePolyfill } from "./useMediaRecorderPolyfil";

const useRecording = (
	setMessage: (message: string) => void,
	onRecordingComplete?: (blob: Blob) => void
) => {
	const [isRecording, setIsRecording] = useState(false);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	// const { getMediaRecorder } = usePolyfill();
	const streamRef = useRef<MediaStream>();
	const chunksRef = useRef<Blob[]>([]);

	const { detectSilence, amplitude, stopSilenceDetection } =
		useSilenceDetection();

	const startSound = useSound("/assets/sounds/start.mp3");
	const stopSound = useSound("/assets/sounds/stop.mp3");

	const cleanup = useCallback(() => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => {
				track.stop();
			});
			streamRef.current = undefined;
		}
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.ondataavailable = null;
			mediaRecorderRef.current.onstop = null;
			mediaRecorderRef.current = null;
		}
	}, []);

	useEffect(() => {
		return () => {
			setMessage("cleanup");
			// cleanup
			cleanup();
		};
	}, []);

	const stopRecording = useCallback(() => {
		setMessage("stopping");
		setIsRecording(false);
		mediaRecorderRef.current?.stop();
		stopSilenceDetection();

		stopSound?.play();
	}, [setMessage, stopSilenceDetection, stopSound]);

	const startRecording = useCallback(async () => {
		cleanup();
		setMessage("requesting permission");
		// request permission
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: true,
		});
		streamRef.current = stream;

		// setup recorder
		mediaRecorderRef.current = new MediaRecorder(streamRef.current);

		mediaRecorderRef.current.ondataavailable = (e) => {
			setMessage("data available");
			chunksRef.current.push(e.data);
		};

		mediaRecorderRef.current.onstop = (e) => {
			setMessage("stopped");
			const blob = new Blob(chunksRef.current, { type: "audio/mp3" });
			onRecordingComplete?.(blob);
			chunksRef.current = [];
		};

		setMessage("allowing start");
		startSound?.play();
		setIsRecording(true);
		mediaRecorderRef.current.start();
		detectSilence(mediaRecorderRef.current, 3000, stopRecording);
	}, [
		detectSilence,
		onRecordingComplete,
		setMessage,
		startSound,
		stopRecording,
	]);

	return {
		isRecording,
		startRecording,
		stopRecording,
		amplitude,
	};
};

export { useRecording };
