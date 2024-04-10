import { useCallback, useRef, useState } from "react";
import { useSilenceDetection } from "./useSilenceDetection";
import { useSound } from "../useSound";
import { getFirstSupportedMimeType } from "@/lib/utils";
// import { useRecordingLogger } from "./logger";
// import { usePolyfill } from "./useMediaRecorderPolyfil";

// this version of useRecording IS NOT compatible with iOS
// but for everywhere else it offers a continuos stream of audio recording
// so users only have to allow microphone permission once
const useRecordingPermissionRequestedOnce__DEPRECATED = (
	onRecordingComplete: (blob: Blob) => void
) => {
	const logger = useRecordingLogger();

	const comingFromStartRecordingFn = useRef(false);
	const comingFromStopRecordingFn = useRef(false);

	const [microphonePermissionGranted, setMicrophonePermissionRequested] =
		useState(false);

	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream>();

	const {
		DEPRECATED__detectSilencePermissionRequestedOnceAdapter: detectSilence,
		amplitude,
		stopSilenceDetection,
	} = useSilenceDetection();

	const startSound = useSound("/assets/sounds/start.mp3");
	const stopSound = useSound("/assets/sounds/stop.mp3");

	// const { getMediaRecorder } = usePolyfill();

	const stopRecording = useCallback(() => {
		try {
			comingFromStopRecordingFn.current = true;
			// trigger another ondataavilable event handler call,
			mediaRecorderRef.current?.requestData();
		} catch (err) {
			logger.log(
				`Failed to stop recording: ${JSON.stringify((err as any).message)}`
			);
		}
	}, [logger]);

	const onDataRequested = useCallback(
		(event: BlobEvent) => {
			try {
				if (comingFromStartRecordingFn.current) {
					startSound?.play();
					if (streamRef.current) {
						detectSilence(streamRef.current, 3000, stopRecording);
					}

					comingFromStartRecordingFn.current = false;
					setIsRecording(true);
					return;
				}

				if (comingFromStopRecordingFn.current) {
					stopSound?.play();
					const chunks = event.data;
					const blob = new Blob([chunks], {
						type: getFirstSupportedMimeType(),
					});

					onRecordingComplete?.(blob);
					stopSilenceDetection();
					comingFromStopRecordingFn.current = false;
					setIsRecording(false);

					// disconnect
					mediaRecorderRef.current?.removeEventListener(
						"dataavailable",
						onDataRequested
					);
					mediaRecorderRef.current?.stop();
					mediaRecorderRef.current = null;
				}
			} catch (err) {
				logger.log(
					`Failed to process recording data: ${JSON.stringify(
						(err as any).message
					)}`
				);
			}
		},
		[
			detectSilence,
			logger,
			onRecordingComplete,
			startSound,
			stopRecording,
			stopSilenceDetection,
			stopSound,
		]
	);

	const requestPermission = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			streamRef.current = stream;
		} catch (err) {
			logger.log(
				`Failed to get microphone permission: ${JSON.stringify(
					(err as any).message
				)}`
			);
		}
	}, [logger]);

	const startRecording = useCallback(async () => {
		try {
			if (!microphonePermissionGranted) {
				// request permission only on the first call to startRecording
				// we keep the mic on the whole time, and use flags to determine when to start and stop recording
				// it doesn't work on iOS, I dont know how but this website managed to get the mic working by only requesting permission once on iOS
				// https://restream.io/tools/mic-test
				await requestPermission();
				setMicrophonePermissionRequested(true);
			}

			// must recreate and destroy the Media Recorder on every start and stop
			mediaRecorderRef.current = new MediaRecorder(streamRef.current!, {
				mimeType: getFirstSupportedMimeType(),
			});

			mediaRecorderRef.current.addEventListener(
				"dataavailable",
				onDataRequested
			);

			mediaRecorderRef.current.start();

			// calling MediaRecorder.requestData() will trigger the ondataavailable event handler
			// passing all media data which has been captured since either the last time a dataavailable event occurred.
			// or since the MediaRecorder was created if no dataavailable event has occurred yet.
			// were calling it now because we want to clear out any data between the end of the last call and the start of this one
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/requestData
			comingFromStartRecordingFn.current = true;
			mediaRecorderRef.current?.requestData();
		} catch (err) {
			logger.log(
				`Failed to start recording: ${JSON.stringify((err as any).message)}`
			);
		}
	}, [logger, microphonePermissionGranted, onDataRequested, requestPermission]);

	return {
		isRecording,
		startRecording,
		stopRecording,
		amplitude,
	};
};

export { useRecordingPermissionRequestedOnce__DEPRECATED };
