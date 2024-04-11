import { useState, useRef, useCallback } from "react";
import { useSilenceDetection } from "@/hooks/useRecording/useSilenceDetection";
import { useSound } from "@/hooks/useSound";
import { Recorder } from "@/lib/recorder";
import { useLogger } from "../useLogger";

// this version of useRecording IS compatible with iOS
// however it asks for microphone permission every time the user starts recording
const useRecording = ({
	onRecordingComplete,
}: {
	onRecordingComplete: (blob: Blob) => void;
}) => {
	const logger = useLogger({
		label: "useRecording",
		color: "#75bfff",
	});

	const [isRecording, setIsRecording] = useState(false);
	const isRecordingRef = useRef<boolean>();
	isRecordingRef.current = isRecording;

	const audioContextRef = useRef<AudioContext | null>(null);
	const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const recorderRef = useRef<any>(null);

	const { detectSilence, amplitude, stopSilenceDetection } =
		useSilenceDetection();

	const startSound = useSound("/assets/sounds/start.mp3");
	const stopSound = useSound("/assets/sounds/stop.mp3");

	const stopRecording = useCallback(() => {
		if (!isRecordingRef.current) {
			logger.warn("Recording is not in progress");
			return;
		}

		stopSound?.play();
		recorderRef.current?.stop();
		recorderRef.current?.exportWAV((blob: Blob) => {
			logger.log(`Recording stopped - blob ${blob}`);

			stopSilenceDetection();
			setIsRecording(false);
			onRecordingComplete(blob);

			// clean up
			audioContextRef.current?.close();
			audioContextRef.current = null;

			microphoneRef.current?.mediaStream.getAudioTracks().forEach((track) => {
				track.stop();
			});
			microphoneRef.current = null;

			recorderRef.current?.clear();
			recorderRef.current = null;
		});
	}, [logger, onRecordingComplete, stopSilenceDetection, stopSound]);

	const startRecording = useCallback(async () => {
		if (isRecordingRef.current) {
			logger.warn("Recording is already in progress");
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});

			const audioContext = new (window.AudioContext ||
				//@ts-ignore
				window.webkitAudioContext)();
			const microphone = audioContext.createMediaStreamSource(stream);
			var recorder = new Recorder(microphone);

			audioContextRef.current = audioContext;
			microphoneRef.current = microphone;
			recorderRef.current = recorder;

			startSound?.play();
			recorder.record();
			setIsRecording(true);
			detectSilence(
				audioContextRef.current,
				microphoneRef.current,
				3000,
				stopRecording
			);
		} catch (error) {
			logger.log(
				`Failed to start recording: ${JSON.stringify((error as any).message)}`
			);
		}
	}, [detectSilence, isRecording, logger, startSound, stopRecording]);

	return { isRecording, startRecording, stopRecording, amplitude };
};

export { useRecording };
