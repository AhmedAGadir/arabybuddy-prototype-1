import { use, useCallback, useEffect, useRef, useState } from "react";
import { useSilenceDetection } from "./useSilenceDetection";
import { useSound } from "./useSound";
// import { usePolyfill } from "./useMediaRecorderPolyfil";

const useRecording = (
	setMessage: (message: string) => void,
	onRecordingComplete: (blob: Blob) => void
) => {
	const comingFromStartRecordingFn = useRef(false);
	const comingFromStopRecordingFn = useRef(false);

	const [microphonePermissionRequested, setMicrophonePermissionRequested] =
		useState(false);

	// potentially remove the state altogether and just use a ref
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

	// const playAudio = useCallback(() => {
	// 	console.log("chunksRef.current", chunksRef.current);
	// 	const blob = new Blob(chunksRef.current, {
	// 		type: "audio/mp3",
	// 	});
	// 	const url = URL.createObjectURL(blob);
	// 	console.log("blog url", url);
	// 	const audio = new Audio(url);
	// 	audio.play();
	// }, []);

	const onDataRequested = useCallback(
		(event: BlobEvent) => {
			console.log(
				"B - ondataavilable recieved that call - isRecording, comingFromStartRecording",
				isRecordingRef.current,
				comingFromStartRecordingFn.current
			);
			if (comingFromStartRecordingFn.current) {
				startSound?.play();
				console.log("C - setting is recording to true");

				comingFromStartRecordingFn.current = false;
				setIsRecording(true);
				return;
			}

			console.log(
				"D - ondataavilable recieved that call - isRecording, comingFromStopRecordingFn",
				isRecordingRef.current,
				comingFromStopRecordingFn.current
			);
			if (comingFromStopRecordingFn.current) {
				stopSound?.play();

				// if (!isRecordingRef.current) {
				// 	console.log(" -- REJECTED");
				// 	return;
				// }

				// console.log("-- ACCEPTED");
				// setMessage("ondataavailable");

				const chunks = event.data;
				console.log("chunks", chunks);
				const blob = new Blob([chunks], { type: "audio/mp3" });
				// onBlobCreated(blob);

				const url = URL.createObjectURL(blob);
				console.log("blob url", url);

				const audio = new Audio(url);
				audio.onloadeddata = (data) => {
					console.log("AUDIO ONLOADED DATA", data);
				};
				audio.load();
				audio
					.play()
					.then((prop) => {
						console.log("successfully playing audio - prop", prop);
					})
					.catch((err) => {
						console.log("error playing audio", err);
					});

				audio.onended = () => {
					console.log("destroying audio");
					// destroy audio and clear
					audio.remove();
					audio.src = "";
				};

				// onRecordingComplete?.(blob);
				console.log("setting is recording to false");

				// console.log("stopping silence detection");
				stopSilenceDetection();
				comingFromStopRecordingFn.current = false;
				setIsRecording(false);

				// disconnect and destroy everything
			}
		},
		[startSound, stopSilenceDetection, stopSound]
	);

	const stopRecording = useCallback(() => {
		setMessage("recording flag off");

		// trigger another ondataavilable event handler call,
		comingFromStopRecordingFn.current = true;
		mediaRecorderRef.current?.requestData();

		setMessage("recording complete, heres the blog");
	}, [setMessage]);

	const requestPermission = useCallback(async () => {
		try {
			console.log("Requesting permission");
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			streamRef.current = stream;
			mediaRecorderRef.current = new MediaRecorder(stream);

			mediaRecorderRef.current.addEventListener(
				"dataavailable",
				onDataRequested
			);

			console.log("starting microphone");
			mediaRecorderRef.current.start();
			detectSilence(mediaRecorderRef.current, 3000, stopRecording);
		} catch (err) {
			console.error("Failed to get user media", err);
		}
	}, [detectSilence, onDataRequested, stopRecording]);

	const cleanup = useCallback(() => {
		setMessage("cleanup");
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => {
				track.stop();
			});
			streamRef.current = undefined;
		}
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.removeEventListener(
				"dataavailable",
				onDataRequested
			);
			mediaRecorderRef.current.onstop = null;
			mediaRecorderRef.current = null;
		}
	}, [onDataRequested, setMessage]);

	const startRecording = useCallback(async () => {
		cleanup();
		console.log("microphonePermissionRequested", microphonePermissionRequested);
		// if (!microphonePermissionRequested) {
		// PAUSING THIS SINCE ITS NOT WORKING: // request permission only on the first call to startRecording
		// PAUSING THIS SINCE ITS NOT WORKING: // we keep the mic on the whole time, and use flags to determine when to start and stop recording
		// browser forces us to request permission on every call - limitation of browser
		// to demonstrate uncomment the code around microphonePermissionRequested, setMicrophonePermissionRequested
		// I dont know how but this website managed to get the mic working by only requesting permission once
		// https://restream.io/tools/mic-test
		await requestPermission();
		// setMicrophonePermissionRequested(true);
		// }

		// calling MediaRecorder.requestData() will trigger the ondataavailable event handler
		// passing all media data which has been captured since either (a) the recording began
		// or (b) since the last time a dataavailable event occurred.
		// were calling it now because we want to clear out any data between the end of the last call
		// and the start of this one
		// https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event
		// https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/requestData
		console.log("A - calling request data");
		comingFromStartRecordingFn.current = true;
		mediaRecorderRef.current?.requestData();
		// cant do anything reliably here (after calling .requestData()), as the ondataavailable event is async
		// so instead we've set comingFromStartRecording to true, and then do whatever we want in the ondataavailable handler
	}, [cleanup, microphonePermissionRequested, requestPermission]);

	return {
		isRecording,
		startRecording,
		stopRecording,
		amplitude,
	};
};

export { useRecording };
