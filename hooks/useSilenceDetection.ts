import { useRef, useState } from "react";

export const useSilenceDetection = () => {
	const silenceTimerRef = useRef<any>(null);
	const [amplitude, setAmplitude] = useState<number>();

	const detectSilence = (
		mediaRecorder: MediaRecorder,
		ms: number,
		onSilenceDetected: () => void
	) => {
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

		javascriptNode.onaudioprocess = () => {
			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			var values = 0;

			var length = array.length;
			for (var i = 0; i < length; i++) {
				values += array[i];
			}

			var average = values / length;
			setAmplitude(Math.floor(average));

			if (average < 10) {
				if (silenceTimerRef.current === null) {
					silenceTimerRef.current = setTimeout(() => {
						onSilenceDetected();

						javascriptNode.disconnect();
						analyser.disconnect();
						microphone.disconnect();
						audioContext.close();
					}, ms);
				}
			} else {
				if (silenceTimerRef.current) {
					clearTimeout(silenceTimerRef.current);
					silenceTimerRef.current = null;
				}
			}
		};
	};

	return { detectSilence, amplitude };
};
