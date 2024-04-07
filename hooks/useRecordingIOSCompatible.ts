import { useState, useRef, useCallback } from "react";
import { useSilenceDetection } from "./useSilenceDetection";
import { useSound } from "./useSound";
import { getFirstSupportedMimeType } from "@/lib/utils";

// this version of useRecording IS compatible with iOS
// however it asks for microphone permission every time the user starts recording
const useRecordingIOSCompatible = (
	onRecordingComplete: (blob: Blob) => void,
	setMessage: (message: string) => void
) => {
	const [isRecording, setIsRecording] = useState(false);
	const isRecordingRef = useRef<boolean>();
	isRecordingRef.current = isRecording;

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream>();

	const { detectSilence, amplitude, stopSilenceDetection } =
		useSilenceDetection();

	const startSound = useSound("/assets/sounds/start.mp3");
	const stopSound = useSound("/assets/sounds/stop.mp3");

	const dataAvailableHandler = useCallback(
		(event: BlobEvent) => {
			try {
				// Handle recorded data here
				const chunks = event.data;
				const blob = new Blob([chunks], {
					type: getFirstSupportedMimeType(),
				});

				onRecordingComplete?.(blob);
				stopSilenceDetection();
			} catch (error) {
				setMessage(
					`Failed to handle recorded data: ${JSON.stringify(
						(error as any).message
					)}`
				);
			}
		},
		[onRecordingComplete, setMessage, stopSilenceDetection]
	);

	// Function to stop recording
	const stopRecording = useCallback(() => {
		if (!isRecording) {
			console.warn("Recording is not in progress");
			return;
		}

		// Stop the media recorder
		stopSound?.play();
		mediaRecorderRef.current?.stop();
		setIsRecording(false);
	}, [isRecording, stopSound]);

	const startRecording = useCallback(async () => {
		if (isRecording) {
			console.warn("Recording is already in progress");
			return;
		}

		try {
			// Request access to the media stream (audio and video)
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			streamRef.current = stream;

			// Initialize MediaRecorder
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;

			// Start recording
			startSound?.play();
			mediaRecorder.start();
			setIsRecording(true);
			detectSilence(mediaRecorderRef.current, 3000, stopRecording);

			// Handle data available after stopping
			mediaRecorder.addEventListener("dataavailable", dataAvailableHandler);

			// Handle recording stop
			mediaRecorder.onstop = () => {
				// Clean up resources
				stream.getTracks().forEach((track) => track.stop());
				streamRef.current = undefined;

				mediaRecorderRef.current?.removeEventListener(
					"dataavailable",
					dataAvailableHandler
				);
				mediaRecorderRef.current?.stop();
				mediaRecorderRef.current = null;
			};
		} catch (error) {
			setMessage(
				`Failed to start recording: ${JSON.stringify((error as any).message)}`
			);
		}
	}, [
		dataAvailableHandler,
		detectSilence,
		isRecording,
		setMessage,
		startSound,
		stopRecording,
	]);

	return { isRecording, startRecording, stopRecording, amplitude };
};

export { useRecordingIOSCompatible };
