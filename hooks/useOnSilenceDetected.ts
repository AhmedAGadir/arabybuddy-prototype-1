import { useRef, useEffect } from "react";

export const useOnSilenceDetected = (
	mediaRecorder: MediaRecorder | undefined,
	onSilenceDetected: () => void
) => {
	const silenceTimerRef = useRef<any>(null);

	useEffect(() => {
		if (mediaRecorder) {
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

				if (average < 10) {
					if (silenceTimerRef.current === null) {
						silenceTimerRef.current = setTimeout(() => {
							onSilenceDetected();

							javascriptNode.disconnect();
							analyser.disconnect();
							microphone.disconnect();
							audioContext.close();
						}, 3000);
					}
				} else {
					if (silenceTimerRef.current) {
						clearTimeout(silenceTimerRef.current);
						silenceTimerRef.current = null;
					}
				}
			};
		}
	}, [mediaRecorder]);
};
