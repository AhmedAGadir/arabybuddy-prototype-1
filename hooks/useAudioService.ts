import { blobToBase64, concatBase64Strs, concatUint8Arrays } from "@/lib/utils";
import { useCallback } from "react";
import { useLogger } from "./useLogger";
import { useServerlessRequest } from "./useServerlessRequest";
import { usePreferences } from "./usePreferences";
import { DEFAULT_USER_PREFERENCES } from "@/lib/database/models/preferences.model";
import _ from "lodash";
import { ArabicDialect } from "@/types/types";
import { TextToSpeechPayload } from "@/app/api/chat/text-to-speech/route";
import { ChatPartnerId } from "@/lib/chatPartners";
const { ObjectId } = require("bson");

const useAudioService = () => {
	const logger = useLogger({ label: "AudioService", color: "#87de74" });

	const {
		makeServerlessRequest: makeServerlessRequestSpeechToText,
		abortRequest: abortSpeechToText,
	} = useServerlessRequest();

	const { preferences } = usePreferences();

	const speechToText = useCallback(
		async (audioBlob: Blob) => {
			try {
				const base64Audio = await blobToBase64(audioBlob);
				const payload = {
					audio: {
						base64Audio,
						type: audioBlob.type.split("/")[1],
						// TODO: add dialect support for transcription
					},
				};

				logger.log("making request to: /api/chat/speech-to-text...", payload);
				const res = await makeServerlessRequestSpeechToText(
					"/api/chat/speech-to-text",
					payload
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
		abortRequest: abortTextToSpeech,
	} = useServerlessRequest();

	const textToSpeech = useCallback(
		async (
			content: string,
			params: {
				chatPartnerId: ChatPartnerId;
				chatDialect: ArabicDialect;
			}
		) => {
			try {
				const payload: TextToSpeechPayload = {
					text: content,
					chat: {
						chatPartnerId: params.chatPartnerId,
						chatDialect: params.chatDialect,
					},
					preferences: {
						voice_customization: {
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
					},
				};
				logger.log("making request to: /api/chat/text-to-speech...", payload);

				const res = await makeServerlessRequestTextToSpeech(
					"/api/chat/text-to-speech",
					payload
				);
				if (!res.ok) {
					throw new Error(`HTTP error status: ${res.status}`);
				}

				const reader =
					res.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>;

				let chunks = [];

				while (true) {
					const { value, done } = await reader.read();
					if (done) break;
					chunks.push(value);
				}

				const concatenatedBuffer = concatUint8Arrays(chunks);

				const decodedBuffer = new TextDecoder().decode(concatenatedBuffer);

				const base64Audios: string[] = [];
				const wordData: {
					_id: string;
					word: string;
					startTime: number;
					endTime: number;
				}[] = [];

				decodedBuffer
					.split("\n\n")
					.filter(Boolean)
					.map((x) => JSON.parse(x))
					.forEach(
						(chunk: {
							audio_base64?: string;
							alignment?: {
								characters: string[];
								character_start_times_seconds: number[];
								character_end_times_seconds: number[];
							};
						}) => {
							const { alignment, audio_base64 } = chunk;

							if (audio_base64) {
								base64Audios.push(audio_base64);
							}

							if (alignment) {
								const {
									characters,
									character_start_times_seconds,
									character_end_times_seconds,
								} = alignment;

								let word = "";
								let wordStartTimeSeconds = 0;
								let wordEndTimeSeconds = 0;

								for (let i = 0; i < characters.length; i++) {
									const character = characters[i];
									const characterStartTimeSeconds =
										character_start_times_seconds[i];
									const characterEndTimeSeconds =
										character_end_times_seconds[i];

									if (character === " ") {
										if (word) {
											const id = new ObjectId().toHexString();
											wordData.push({
												_id: id,
												word,
												startTime: wordStartTimeSeconds,
												endTime: wordEndTimeSeconds,
											});
										}
										word = "";
										wordStartTimeSeconds = 0;
										wordEndTimeSeconds = 0;
									} else {
										if (!word) {
											wordStartTimeSeconds = characterStartTimeSeconds;
										}
										wordEndTimeSeconds = characterEndTimeSeconds;
										word += character;

										if (i === characters.length - 1) {
											const id = new ObjectId().toHexString();
											wordData.push({
												_id: id,
												word,
												startTime: wordStartTimeSeconds,
												endTime: wordEndTimeSeconds,
											});
										}
									}
								}
							}
						}
					);

				return {
					base64Audio: concatBase64Strs(base64Audios),
					wordData,
				};
			} catch (error) {
				logger.error("Failed to convert text to speech", error);
				throw error;
			}
		},
		[logger, makeServerlessRequestTextToSpeech, preferences]
	);

	return {
		speechToText,
		textToSpeech,
		abortSpeechToText,
		abortTextToSpeech,
	};
};

export { useAudioService };
