import { useRef, useState } from "react";
import { useLogger } from "./useLogger";

const useSilenceDetectionLogger = () => {
	const logger = useLogger({
		label: "useSilenceDetection",
		color: "#75bfff",
		toggle: true,
	});
	return logger;
};

export const useSilenceDetection = () => {
	const logger = useSilenceDetectionLogger();

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
		logger.log("stopping silence detection");
		clearSilenceTimer();
		setStopListeningFromExternalSource(true);
	};

	const detectSilence = (
		audioContext: AudioContext,
		microphone: MediaStreamAudioSourceNode,
		ms: number,
		onSilenceDetected: () => void
	) => {
		logger.log("detecting silence");
		setStopListeningFromExternalSource(false);

		const analyser = audioContext.createAnalyser();
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

	const DEPRECATED__detectSilencePermissionRequestedOnceAdapter = (
		stream: MediaStream,
		ms: number,
		onSilenceDetected: () => void
	) => {
		const audioContext = new AudioContext();
		const microphone = audioContext.createMediaStreamSource(stream);

		detectSilence(audioContext, microphone, ms, onSilenceDetected);
	};

	return {
		detectSilence,
		amplitude,
		stopSilenceDetection,
		DEPRECATED__detectSilencePermissionRequestedOnceAdapter,
	};
};
