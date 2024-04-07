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

	const getMediaRecorder = (
		stream: MediaStream,
		passedInOptions?: { [key: string]: any }
	): MediaRecorder => {
		let mediaRecorder: MediaRecorder;

		if (
			!window.MediaRecorder ||
			!window.MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
		) {
			console.log("here");
			const options = { mimeType: "audio/mp3", ...passedInOptions };

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
			mediaRecorder = new MediaRecorder(stream, passedInOptions);
		}

		return mediaRecorder;
	};

	return { getMediaRecorder };
};

export { useMediaRecorderPolyfill as usePolyfill };
