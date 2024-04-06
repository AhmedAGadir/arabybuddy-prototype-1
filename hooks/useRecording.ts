import { useCallback, useRef, useState } from "react";
import { useSilenceDetection } from "./useSilenceDetection";
import { useSound } from "./useSound";
// import { usePolyfill } from "./useMediaRecorderPolyfil";

const MIME_TYPE = "audio/webm";

const useRecording = (
	onRecordingComplete: (blob: Blob) => void,
	setMessage: (message: string) => void
) => {
	const comingFromStartRecordingFn = useRef(false);
	const comingFromStopRecordingFn = useRef(false);

	const [microphonePermissionRequested, setMicrophonePermissionRequested] =
		useState(false);

	const [isRecording, setIsRecording] = useState(false);
	const isRecordingRef = useRef(false);
	isRecordingRef.current = isRecording;

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	// const { getMediaRecorder } = usePolyfill();
	const streamRef = useRef<MediaStream>();

	const { detectSilence, amplitude, stopSilenceDetection } =
		useSilenceDetection();

	const startSound = useSound("/assets/sounds/start.mp3");
	const stopSound = useSound("/assets/sounds/stop.mp3");

	const stopRecording = useCallback(() => {
		comingFromStopRecordingFn.current = true;
		// trigger another ondataavilable event handler call,
		mediaRecorderRef.current?.requestData();
	}, []);

	const onDataRequested = useCallback(
		(event: BlobEvent) => {
			if (comingFromStartRecordingFn.current) {
				startSound?.play();
				if (mediaRecorderRef.current) {
					detectSilence(mediaRecorderRef.current, 3000, stopRecording);
				}

				comingFromStartRecordingFn.current = false;
				setIsRecording(true);
				return;
			}

			if (comingFromStopRecordingFn.current) {
				stopSound?.play();

				const chunks = event.data;
				const blob = new Blob([chunks], { type: MIME_TYPE });
				// const url = URL.createObjectURL(blob);
				// const audio = new Audio(url);
				// audio.preload = "none";
				// audio.onloadeddata = (data) => {
				// 	console.log("AUDIO ONLOADED DATA", data);
				// };
				// audio.load();
				// audio
				// 	.play()
				// 	.then((prop) => {
				// 		console.log("successfully playing audio - prop", prop);
				// 	})
				// 	.catch((err) => {
				// 		console.log("error playing audio", err);
				// 	});

				// audio.onended = () => {
				// 	console.log("destroying audio");
				// 	// destroy audio and clear
				// 	URL.revokeObjectURL(url);
				// 	// audio.remove();
				// 	// audio.src = "";
				// };

				onRecordingComplete?.(blob);

				// const a = document.createElement("a");
				// document.body.appendChild(a);
				// a.href = URL.createObjectURL(blob);
				// a.download = "audio.webm";
				// a.click();
				// window.URL.revokeObjectURL(a.href);
				// a.remove();

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
		},
		[
			detectSilence,
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
			console.error("Failed to get user media", err);
		}
	}, []);

	// const cleanup = useCallback(() => {
	// 	setMessage("cleanup");
	// 	if (streamRef.current) {
	// 		streamRef.current.getTracks().forEach((track) => {
	// 			track.stop();
	// 		});
	// 		streamRef.current = undefined;
	// 	}
	// 	if (mediaRecorderRef.current) {
	// 		mediaRecorderRef.current.removeEventListener(
	// 			"dataavailable",
	// 			onDataRequested
	// 		);
	// 		mediaRecorderRef.current.onstop = null;
	// 		mediaRecorderRef.current = null;
	// 	}
	// }, [onDataRequested, setMessage]);

	const startRecording = useCallback(async () => {
		// cleanup();
		if (!microphonePermissionRequested) {
			// PAUSING THIS SINCE ITS NOT WORKING: // request permission only on the first call to startRecording
			// PAUSING THIS SINCE ITS NOT WORKING: // we keep the mic on the whole time, and use flags to determine when to start and stop recording
			// browser forces us to request permission on every call - limitation of browser
			// to demonstrate uncomment the code around microphonePermissionRequested, setMicrophonePermissionRequested
			// I dont know how but this website managed to get the mic working by only requesting permission once
			// https://restream.io/tools/mic-test
			await requestPermission();
			setMicrophonePermissionRequested(true);
		}

		try {
			mediaRecorderRef.current = new MediaRecorder(streamRef.current!, {
				mimeType: MIME_TYPE,
			});

			mediaRecorderRef.current.addEventListener(
				"dataavailable",
				onDataRequested
			);

			mediaRecorderRef.current.start();

			// calling MediaRecorder.requestData() will trigger the ondataavailable event handler
			// passing all media data which has been captured since either (a) the recording began
			// or (b) since the last time a dataavailable event occurred.
			// were calling it now because we want to clear out any data between the end of the last call
			// and the start of this one
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/requestData
			comingFromStartRecordingFn.current = true;
			mediaRecorderRef.current?.requestData();
		} catch (err) {
			setMessage(`Failed to start recording: ${JSON.stringify(err)}`);
		}
		// cant do anything reliably here (after calling .requestData()), as the ondataavailable event is async
		// so instead we've set comingFromStartRecording to true, and then do whatever we want in the ondataavailable handler
	}, [
		microphonePermissionRequested,
		onDataRequested,
		requestPermission,
		setMessage,
	]);

	return {
		isRecording,
		startRecording,
		stopRecording,
		amplitude,
	};
};

export { useRecording };
