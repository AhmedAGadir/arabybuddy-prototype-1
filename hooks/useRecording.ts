import { useCallback, useEffect, useRef, useState } from "react";
import { useSilenceDetection } from "./useSilenceDetection";
import { MediaRecorder } from "@zappar/mediarecorder";

const useRecording = (onRecordingComplete?: (blob: Blob) => void) => {
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);

	const chunksRef = useRef<Blob[]>([]);

	const [startSound, setStartSound] = useState<HTMLAudioElement | null>(null);
	const [stopSound, setStopSound] = useState<HTMLAudioElement | null>(null);

	useEffect(() => {
		setStartSound(new Audio("/assets/sounds/start.mp3"));
		setStopSound(new Audio("/assets/sounds/stop.mp3"));
	}, []);

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
			mediaRecorderRef.current = new MediaRecorder(stream);
			mediaRecorderRef.current.start();

			mediaRecorderRef.current.ondataavailable = (e) => {
				chunksRef.current.push(e.data);
			};

			mediaRecorderRef.current.onstop = (e) => {
				const blob = new Blob(chunksRef.current, { type: "audio/wav" });
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
	}, [detectSilence, onRecordingComplete, startSound, stopRecording]);

	return {
		isRecording,
		startRecording,
		stopRecording,
		amplitude,
	};
};

export { useRecording };
