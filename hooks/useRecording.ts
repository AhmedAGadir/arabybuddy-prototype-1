import { useState, useRef, useCallback } from "react";
import { useSilenceDetection } from "@/hooks/useSilenceDetection";
import { useSound } from "@/hooks/useSound";
import { Recorder } from "@/lib/recorder";
import { useLogger } from "./useLogger";

// this version of useRecording IS compatible with iOS
// however it asks for microphone permission every time the user starts recording
const useRecording = () => {
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

	const stopRecordingCleanup = useCallback(() => {
		audioContextRef.current?.close();
		audioContextRef.current = null;

		microphoneRef.current?.mediaStream.getAudioTracks().forEach((track) => {
			track.stop();
		});
		microphoneRef.current = null;

		recorderRef.current?.clear();
		recorderRef.current = null;
	}, []);

	const stopRecording = useCallback(
		async ({ force = false }: { force?: boolean } = {}) => {
			if (!isRecordingRef.current) {
				logger.warn("Recording is not in progress");
				return { audioBlob: null };
			}

			if (force) {
				logger.log("Force stopped recording audio recording");
				stopRecordingCleanup();
				recorderRef.current?.stop();
				stopSilenceDetection();
				setIsRecording(false);
				return { audioBlob: null };
			}

			stopSound?.play();
			recorderRef.current?.stop();

			const responseBlobPromise = new Promise<Blob>((resolve) => {
				recorderRef.current?.exportWAV((blob: Blob) => {
					resolve(blob);
				});
			});

			const audioBlob = await responseBlobPromise;

			stopSilenceDetection();
			setIsRecording(false);
			// clean up
			stopRecordingCleanup();
			logger.log(`Recording stopped - blob ${audioBlob}`);
			return { audioBlob };
		},
		[isRecording, logger, stopRecordingCleanup, stopSilenceDetection, stopSound]
	);

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
			logger.log("Recording started");
			recorder.record();
			setIsRecording(true);
			detectSilence(
				audioContextRef.current,
				microphoneRef.current,
				3000,
				stopRecording
			);
		} catch (error) {
			logger.log(`Failed to start recording: ${(error as any).message}`);
		}
	}, [detectSilence, logger, startSound, stopRecording]);

	return { isRecording, startRecording, stopRecording, amplitude };
};

export { useRecording };
