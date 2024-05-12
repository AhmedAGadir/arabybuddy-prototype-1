import { blobToBase64 } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { useLogger } from "./useLogger";
import { useServerlessRequest } from "./useServerlessRequest";
import { usePreferences } from "./usePreferences";
import {
	DEFAULT_USER_PREFERENCES,
	IPreferences,
} from "@/lib/database/models/preferences.model";
import io from "Socket.IO-client";
import { ArabicDialect } from "@/types/types";

type AssistantGender = IPreferences["assistant_gender"];

type VoiceMap = {
	[D in ArabicDialect]: {
		[K in AssistantGender]: { name: string; voiceId: string };
	};
};

// TODO: add voice support for other dialects
export const voiceLibrary = {
	rachel: { name: "Rachel", voiceId: "JOoOS0ygQqJknGa2C14N" },
	joey: {
		name: "Joey - Youthful and Energetic",
		voiceId: "bjL4GZJa40TcWjwdphFX",
	},
	mourad: { name: "Mourad", voiceId: "kERwN6X2cY8g1XbfzJsX" },
	sana: { name: "Sana", voiceId: "mRdG9GYEjJmIzqbYTidv" },
};

export const voices: VoiceMap = {
	"Modern Standard Arabic": {
		young_female: voiceLibrary.rachel,
		young_male: voiceLibrary.joey,
		old_male: voiceLibrary.mourad,
		old_female: voiceLibrary.sana,
	},
	Egyptian: {
		young_female: voiceLibrary.rachel,
		young_male: voiceLibrary.joey,
		old_male: voiceLibrary.mourad,
		old_female: voiceLibrary.sana,
	},
	Levantine: {
		young_female: voiceLibrary.rachel,
		young_male: voiceLibrary.joey,
		old_male: voiceLibrary.mourad,
		old_female: voiceLibrary.sana,
	},
	Gulf: {
		young_female: voiceLibrary.rachel,
		young_male: voiceLibrary.joey,
		old_male: voiceLibrary.mourad,
		old_female: voiceLibrary.sana,
	},
	Maghrebi: {
		young_female: voiceLibrary.rachel,
		young_male: voiceLibrary.joey,
		old_male: voiceLibrary.mourad,
		old_female: voiceLibrary.sana,
	},
	Sudanese: {
		young_female: voiceLibrary.rachel,
		young_male: voiceLibrary.joey,
		old_male: voiceLibrary.mourad,
		old_female: voiceLibrary.sana,
	},
	Iraqi: {
		young_female: voiceLibrary.rachel,
		young_male: voiceLibrary.joey,
		old_male: voiceLibrary.mourad,
		old_female: voiceLibrary.sana,
	},
	Yemeni: {
		young_female: voiceLibrary.rachel,
		young_male: voiceLibrary.joey,
		old_male: voiceLibrary.mourad,
		old_female: voiceLibrary.sana,
	},
};

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
		// makeServerlessRequest: makeServerlessRequestTextToSpeech,
		abortRequest: abortTextToSpeechRequest,
	} = useServerlessRequest();

	const textToSpeech = useCallback(
		async (text: string) => {
			try {
				// logger.log("making request to: /api/chat/text-to-speech...", params);

				// TODO: use variable voiceId
				// const voiceId =
				// 	voices[preferences.arabic_dialect][preferences.assistant_gender]
				// 		.voiceId;
				// TODO: use this model
				// const modelId = "eleven_multilingual_v2";

				const voiceId = "mRdG9GYEjJmIzqbYTidv"; // Sana
				const modelId = "eleven_turbo_v2";

				const voice_settings = {
					stability:
						preferences.voice_stability ??
						DEFAULT_USER_PREFERENCES.voice_stability,
					similarity_boost:
						preferences.voice_similarity_boost ??
						DEFAULT_USER_PREFERENCES.voice_similarity_boost,
					style:
						preferences.voice_style ?? DEFAULT_USER_PREFERENCES.voice_style,
					use_speaker_boost:
						preferences.voice_use_speaker_boost ??
						DEFAULT_USER_PREFERENCES.voice_use_speaker_boost,
				};

				const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}`;
				const socket = new WebSocket(wsUrl);

				// 2. Initialize the connection by sending the BOS message
				socket.onopen = function (event) {
					const bosMessage = {
						text,
						voice_settings,
						xi_api_key: MY_API_KEY,
						try_trigger_generation: true,
					};
					socket.send(JSON.stringify(bosMessage));

					// const completionMessage = {
					// 	text,
					// 	voice_settings,
					// 	xi_api_key: MY_API_KEY,
					// 	try_trigger_generation: true,
					// };

					// socket.send(JSON.stringify(completionMessage));

					// ***** we can send multiple messages to the server
					// 3. Send the input text message ("Hello World")
					// const textMessage = {
					// 	text: "Hello World ",
					// 	try_trigger_generation: true,
					// };

					// socket.send(JSON.stringify(textMessage));

					// // 4. Send the EOS message with an empty string
					// const eosMessage = {
					// 	text: "",
					// };

					// socket.send(JSON.stringify(eosMessage));
				};

				// 5. Handle server responses
				socket.onmessage = function (event) {
					console.log("onmessage", event);
					const response = JSON.parse(event.data);

					console.log("Server response:", response);

					if (response.audio) {
						// decode and handle the audio data (e.g., play it)
						const audioChunk = atob(response.audio); // decode base64
						console.log("Received audio chunk");
					} else {
						console.log("No audio data in the response");
					}

					if (response.isFinal) {
						// the generation is complete
					}

					if (response.normalizedAlignment) {
						// use the alignment info if needed
					}
				};

				// Handle errors
				socket.onerror = function (error) {
					console.error(`WebSocket Error: ${error}`);
				};

				// Handle socket closing
				socket.onclose = function (event) {
					if (event.wasClean) {
						console.info(
							`Connection closed cleanly, code=${event.code}, reason=${event.reason}`
						);
					} else {
						console.warn("Connection died");
					}
				};
			} catch (error) {
				logger.error("Failed to convert text to speech", error);
				throw error;
			}
		},
		[logger, preferences]
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
