import { blobToBase64 } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { useLogger } from "./useLogger";
import { useServerlessRequest } from "./useServerlessRequest";
import { usePreferences } from "./usePreferences";
import { DEFAULT_USER_PREFERENCES } from "@/lib/database/models/preferences.model";

const useAudioService = () => {
	const logger = useLogger({ label: "AudioService", color: "#87de74" });

	const {
		makeServerlessRequest: makeServerlessRequestSpeechToText,
		abortRequest: abortSpeechToTextRequest,
	} = useServerlessRequest();

	const { preferences } = usePreferences();

	const speechToText = useCallback(
		async (audioBlob: Blob) => {
			try {
				const base64Audio = await blobToBase64(audioBlob);
				const params = {
					audio: {
						base64Audio,
						type: audioBlob.type.split("/")[1],
						// TODO: add dialect support for transcription
					},
				};

				logger.log("making request to: /api/chat/speech-to-text...", params);
				const res = await makeServerlessRequestSpeechToText(
					"/api/chat/speech-to-text",
					{ ...params }
				);

				const data = await res.json();

				if (res.status !== 200) {
					throw (
						data.error || new Error(`Request failed with status ${res.status}`)
					);
				}

				const { transcription } = data;

				logger.log("transcription", transcription);

				return { transcription };
			} catch (error) {
				logger.error("Failed to convert speech to text", error);
				throw error;
			}
		},
		[logger, makeServerlessRequestSpeechToText]
	);

	const {
		makeServerlessRequest: makeServerlessRequestTextToSpeech,
		abortRequest: abortTextToSpeechRequest,
	} = useServerlessRequest();

	// const socket = io();

	// socket.on("connect", () => {
	// 	console.log("Connected to WebSocket server");
	// });

	// socket.disconnect();

	// const [ws, setWs] = useState<WebSocket | null>(null);

	// useEffect(() => {
	// 	// Construct the WebSocket URL
	// 	const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}`;

	// 	// Create a WebSocket connection
	// 	const socket = new WebSocket(wsUrl);

	// 	// Connection opened
	// 	socket.addEventListener('open', (event) => {
	// 	  console.log('WebSocket is now open.');
	// 	});

	// 	// Listen for messages
	// 	socket.addEventListener('message', (event) => {
	// 	  console.log('Message from server: ', event.data);
	// 	  // Handle the received audio data here
	// 	});

	// 	// Connection closed
	// 	socket.addEventListener('close', (event) => {
	// 	  console.log('WebSocket is closed now.');
	// 	});

	// 	// Set the WebSocket instance
	// 	setWs(socket);

	// 	// Clean up on component unmount
	// 	return () => {
	// 	  socket.close();
	// 	};

	const textToSpeech = useCallback(
		async (content: string) => {
			try {
				const params = {
					content,
					voice_customization: {
						arabic_dialect:
							preferences.arabic_dialect ??
							DEFAULT_USER_PREFERENCES.arabic_dialect,
						assistant_gender:
							preferences.assistant_gender ??
							DEFAULT_USER_PREFERENCES.assistant_gender,
						voice_stability:
							preferences.voice_stability ??
							DEFAULT_USER_PREFERENCES.voice_stability,
						voice_similarity_boost:
							preferences.voice_similarity_boost ??
							DEFAULT_USER_PREFERENCES.voice_similarity_boost,
						voice_style:
							preferences.voice_style ?? DEFAULT_USER_PREFERENCES.voice_style,
						voice_use_speaker_boost:
							preferences.voice_use_speaker_boost ??
							DEFAULT_USER_PREFERENCES.voice_use_speaker_boost,
					},
				};

				logger.log("making request to: /api/chat/text-to-speech...", params);

				const res = await makeServerlessRequestTextToSpeech(
					"/api/chat/text-to-speech",
					{ ...params }
				);

				const data = await res.json();

				if (res.status !== 200) {
					throw (
						data.error || new Error(`Request failed with status ${res.status}`)
					);
				}

				const { base64Audio } = data;

				logger.log("base64Audio", `${base64Audio.slice(0, 10)}...`);

				return { base64Audio };
			} catch (error) {
				logger.error("Failed to convert text to speech", error);
				throw error;
			}
		},
		[logger, makeServerlessRequestTextToSpeech, preferences]
	);

	// const DEPRECATED_textToSpeech = useCallback(
	// 	async (content: string) => {
	// 		try {
	// 			const params = {
	// 				content,
	// 				voice_customization: {
	// 					arabic_dialect:
	// 						preferences.arabic_dialect ??
	// 						DEFAULT_USER_PREFERENCES.arabic_dialect,
	// 					assistant_gender:
	// 						preferences.assistant_gender ??
	// 						DEFAULT_USER_PREFERENCES.assistant_gender,
	// 					voice_stability:
	// 						preferences.voice_stability ??
	// 						DEFAULT_USER_PREFERENCES.voice_stability,
	// 					voice_similarity_boost:
	// 						preferences.voice_similarity_boost ??
	// 						DEFAULT_USER_PREFERENCES.voice_similarity_boost,
	// 					voice_style:
	// 						preferences.voice_style ?? DEFAULT_USER_PREFERENCES.voice_style,
	// 					voice_use_speaker_boost:
	// 						preferences.voice_use_speaker_boost ??
	// 						DEFAULT_USER_PREFERENCES.voice_use_speaker_boost,
	// 				},
	// 			};

	// 			logger.log("making request to: /api/chat/text-to-speech...", params);

	// 			const { base64Audio } = await makeServerlessRequestTextToSpeech(
	// 				"/api/chat/text-to-speech",
	// 				{ ...params }
	// 			);

	// 			logger.log("base64Audio", `${base64Audio.slice(0, 10)}...`);

	// 			return { base64Audio };
	// 		} catch (error) {
	// 			logger.error("Failed to convert text to speech", error);
	// 			throw error;
	// 		}
	// 	},
	// 	[logger, makeServerlessRequestTextToSpeech, preferences]
	// );

	return {
		speechToText,
		textToSpeech,
		abortSpeechToTextRequest,
		abortTextToSpeechRequest,
	};
};

export { useAudioService };
