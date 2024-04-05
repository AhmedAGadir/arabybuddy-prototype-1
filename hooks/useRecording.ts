import { useCallback, useRef, useState } from "react";
import { useSilenceDetection } from "./useSilenceDetection";
import { useSound } from "./useSound";
import { usePolyfill } from "./usePolyfil";

const useRecording = (onRecordingComplete?: (blob: Blob) => void) => {
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	const { getMediaRecorder } = usePolyfill();

	const startSound = useSound("/assets/sounds/start.mp3");
	const stopSound = useSound("/assets/sounds/stop.mp3");

	const { detectSilence, amplitude, stopSilenceDetection } =
		useSilenceDetection();

	const stopRecording = useCallback(() => {
		setIsRecording(false);
		mediaRecorderRef.current?.stop();
		stopSilenceDetection();

		stopSound?.play();
	}, [stopSilenceDetection, stopSound]);

	const startRecording = useCallback(() => {
		startSound?.play();

		setIsRecording(true);

		navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
			mediaRecorderRef.current = getMediaRecorder(stream);

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
		});
	}, [
		detectSilence,
		getMediaRecorder,
		onRecordingComplete,
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
