import { useEffect } from "react";

declare var OpusMediaRecorder: MediaRecorder;

const useExternalScript = (src: string) => {
	useEffect(() => {
		const script = document.createElement("script");
		script.src = src;
		script.async = true;

		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, [src]);
};

const useMediaRecorderPolyfill = () => {
	useExternalScript(
		"https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OpusMediaRecorder.umd.js"
	);
	useExternalScript(
		"https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/encoderWorker.umd.js"
	);

	const getMediaRecorder = (stream: MediaStream): MediaRecorder => {
		let mediaRecorder: MediaRecorder;

		if (
			!window.MediaRecorder ||
			!window.MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
		) {
			// Choose desired format like audio/webm. Default is audio/ogg
			// audio/webm
			// audio/webm; codecs=opus
			// audio/ogg
			// audio/ogg; codecs=opus
			// audio/wav or audio/wave
			const options = { mimeType: "audio/ogg" };

			const workerOptions = {
				OggOpusEncoderWasmPath:
					"https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OggOpusEncoder.wasm",
				WebMOpusEncoderWasmPath:
					"https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/WebMOpusEncoder.wasm",
			};

			// @ts-ignore
			window.MediaRecorder = OpusMediaRecorder;

			mediaRecorder = new MediaRecorder(
				stream,
				options,
				// @ts-ignore
				workerOptions
			);
		} else {
			mediaRecorder = new MediaRecorder(stream);
		}

		return mediaRecorder;
	};

	return { getMediaRecorder };
};

export { useMediaRecorderPolyfill as usePolyfill };
