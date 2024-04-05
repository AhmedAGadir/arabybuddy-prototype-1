import { useCallback, useEffect, useRef, useState } from "react";
import { useSilenceDetection } from "./useSilenceDetection";

const useExternalScript = (src) => {
	useEffect(() => {
		// Create script element
		const script = document.createElement("script");
		script.src = src;
		script.async = true;

		// Append script to the body
		document.body.appendChild(script);

		// Remove script on cleanup
		return () => {
			document.body.removeChild(script);
		};
	}, [src]); // Re-run effect if src changes
};

const useRecording = (onRecordingComplete?: (blob: Blob) => void) => {
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	useExternalScript(
		"https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OpusMediaRecorder.umd.js"
	);
	useExternalScript(
		"https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/encoderWorker.umd.js"
	);

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
			if (
				!window.MediaRecorder ||
				!window.MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
			) {
				// Choose desired format like audio/webm. Default is audio/ogg
				// audio/webm
				// audio/webm; codecs=opus
				// audio/ogg
				// audio/ogg; codecs=opus
				// audio/wav or audio/wave
				const options = { mimeType: "audio/webm" };

				const workerOptions = {
					OggOpusEncoderWasmPath:
						"https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OggOpusEncoder.wasm",
					WebMOpusEncoderWasmPath:
						"https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/WebMOpusEncoder.wasm",
				};

				window.MediaRecorder = OpusMediaRecorder;

				mediaRecorderRef.current = new MediaRecorder(
					stream,
					options,
					workerOptions
				);
			} else {
				mediaRecorderRef.current = new MediaRecorder(stream);
			}

			mediaRecorderRef.current.start();

			mediaRecorderRef.current.ondataavailable = (e) => {
				chunksRef.current.push(e.data);
			};

			mediaRecorderRef.current.onstop = (e) => {
				const blob = new Blob(chunksRef.current, { type: "audio/webm" });
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
