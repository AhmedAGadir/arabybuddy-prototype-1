import { useRef, useState } from "react";

export const useSilenceDetection = () => {
	const silenceTimerRef = useRef<any>(null);
	const [amplitude, setAmplitude] = useState<number | null>(null);

	const [stopListeningFromExternalSource, setStopListeningFromExternalSource] =
		useState(false);
	// need to use a ref to stop onaudioprocess from creating a closure over the old stopListeningFromExternalSource value
	const stopListeningFromExternalSourceRef = useRef<boolean>();
	stopListeningFromExternalSourceRef.current = stopListeningFromExternalSource;

	const clearSilenceTimer = () => {
		if (silenceTimerRef.current) {
			clearTimeout(silenceTimerRef.current);
			silenceTimerRef.current = null;
		}
	};

	const stopSilenceDetection = () => {
		console.log("stopping silence detection");
		clearSilenceTimer();
		setStopListeningFromExternalSource(true);
	};

	const detectSilence = (
		mediaRecorder: MediaRecorder,
		ms: number,
		onSilenceDetected: () => void
	) => {
		console.log("detecting silence");
		setStopListeningFromExternalSource(false);

		const audioContext = new AudioContext();
		const analyser = audioContext.createAnalyser();
		const microphone = audioContext.createMediaStreamSource(
			mediaRecorder.stream
		);
		const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

		analyser.smoothingTimeConstant = 0.8;
		analyser.fftSize = 1024;

		microphone.connect(analyser);
		analyser.connect(javascriptNode);
		javascriptNode.connect(audioContext.destination);

		const audioProcessHandler = () => {
			if (stopListeningFromExternalSourceRef.current) {
				disconnect();
				clearSilenceTimer();
				return;
			}
			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			var values = 0;

			var length = array.length;
			for (var i = 0; i < length; i++) {
				values += array[i];
			}

			var average = values / length;
			setAmplitude(Math.floor(average));

			const MIN_AMPLITUDE = 10;

			const isSilent = average < MIN_AMPLITUDE;

			if (isSilent) {
				if (silenceTimerRef.current === null) {
					silenceTimerRef.current = setTimeout(() => {
						disconnect();
						clearSilenceTimer();

						setAmplitude(null);
						onSilenceDetected();
					}, ms);
				}
			} else {
				clearSilenceTimer();
			}
		};

		const disconnect = () => {
			javascriptNode.disconnect();
			analyser.disconnect();
			microphone.disconnect();
			audioContext.close();
			javascriptNode.removeEventListener("audioprocess", audioProcessHandler);
		};

		javascriptNode.addEventListener("audioprocess", audioProcessHandler);
	};

	return {
		detectSilence,
		amplitude,
		stopSilenceDetection,
	};
};
