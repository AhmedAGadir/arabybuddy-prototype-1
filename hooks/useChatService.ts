import { useCallback, useRef } from "react";
import { useLogger } from "./useLogger";
import { usePreferences } from "./usePreferences";
import { DEFAULT_USER_PREFERENCES } from "@/lib/database/models/preferences.model";
import { useUser } from "@clerk/nextjs";
import {
	CompletionMode,
	OpenAIMessage,
	completionMode,
} from "@/lib/api/assistant";

const useChatService = () => {
	const logger = useLogger({ label: "ChatService", color: "#fe7de9" });
	const { user } = useUser();
	const { preferences } = usePreferences();
	const controllerRef = useRef<AbortController>();

	async function* makeChatCompletionGenerator(
		messageHistory: OpenAIMessage[],
		options: { mode: CompletionMode }
	) {
		try {
			const latestMessage = messageHistory[messageHistory.length - 1];

			const messages =
				options.mode === completionMode.TRANSLATE ||
				options.mode === completionMode.REPHRASE
					? [latestMessage]
					: messageHistory;

			const params = {
				messages,
				mode: options.mode,
				firstName: user?.firstName,
				preferences: {
					arabic_dialect:
						preferences.arabic_dialect ??
						DEFAULT_USER_PREFERENCES.arabic_dialect,
					assistant_language_level:
						preferences.assistant_language_level ??
						DEFAULT_USER_PREFERENCES.assistant_language_level,
					assistant_tone:
						preferences.assistant_tone ??
						DEFAULT_USER_PREFERENCES.assistant_tone,
					assistant_detail_level:
						preferences.assistant_detail_level ??
						DEFAULT_USER_PREFERENCES.assistant_detail_level,
					user_interests:
						preferences.user_interests ??
						DEFAULT_USER_PREFERENCES.user_interests,
					user_personality_traits:
						preferences.user_personality_traits ??
						DEFAULT_USER_PREFERENCES.user_personality_traits,
				},
			};

			const controller = new AbortController();
			controllerRef.current = controller;
			const { signal } = controller;

			logger.log("making request to: /api/chat/assistant...", params);

			const res = await fetch("/api/chat/assistant", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(params),
				signal,
			});

			if (!res.ok) {
				throw new Error(`HTTP error status: ${res.status}`);
			}

			let role: "assistant" | "user";

			if (
				options.mode === completionMode.TRANSLATE ||
				options.mode === completionMode.REPHRASE
			) {
				role = latestMessage.role;
			} else {
				role = "assistant";
			}

			const reader =
				res.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>;
			const decoder = new TextDecoder();

			let content = "";

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				const text = decoder.decode(value, { stream: true });
				content += text;

				const completionMessage: OpenAIMessage = {
					role,
					content,
				};

				yield completionMessage;
			}
		} catch (error) {
			logger.error("Failed to make chat completion", error);
			throw error;
		}
	}

	const makeChatCompletion = async (
		messageHistory: OpenAIMessage[],
		options: { mode: CompletionMode } = {
			mode: completionMode.DEFAULT,
		}
	) => makeChatCompletionGenerator(messageHistory, options);

	const abortMakeChatCompletion = useCallback(() => {
		logger.log("aborting makeChatCompletion request");
		controllerRef.current?.abort();
		controllerRef.current = undefined;
	}, [logger]);

	return { makeChatCompletion, abortMakeChatCompletion };

	// const DEPRECATED_makeChatCompletion = useCallback(
	// 	async (
	// 		messageHistory: OpenAIMessage[],
	// 		options: { mode: "regenerate" | "rephrase" | "translate" } | undefined
	// 	) => {
	// 		try {
	// 			const params = {
	// 				messageHistory,
	// 				mode: options?.mode,
	// 				firstName: user?.firstName,
	// 				preferences: {
	// 					arabic_dialect:
	// 						preferences.arabic_dialect ??
	// 						DEFAULT_USER_PREFERENCES.arabic_dialect,
	// 					assistant_language_level:
	// 						preferences.assistant_language_level ??
	// 						DEFAULT_USER_PREFERENCES.assistant_language_level,
	// 					assistant_tone:
	// 						preferences.assistant_tone ??
	// 						DEFAULT_USER_PREFERENCES.assistant_tone,
	// 					assistant_detail_level:
	// 						preferences.assistant_detail_level ??
	// 						DEFAULT_USER_PREFERENCES.assistant_detail_level,
	// 					user_interests:
	// 						preferences.user_interests ??
	// 						DEFAULT_USER_PREFERENCES.user_interests,
	// 					user_personality_traits:
	// 						preferences.user_personality_traits ??
	// 						DEFAULT_USER_PREFERENCES.user_personality_traits,
	// 				},
	// 			};
	// 			logger.log("making request to: /api/chat/assistant...", params);
	// 			const { messages: updatedMessages } = await makeServerlessRequest(
	// 				"/api/chat/assistant",
	// 				{ ...params }
	// 			);

	// 			logger.log("updatedMessages", updatedMessages);

	// 			return { messages: updatedMessages as IMessage[] };
	// 		} catch (error) {
	// 			logger.error("Failed to add chat message", error);
	// 			throw error;
	// 		}
	// 	},
	// 	[logger, makeServerlessRequest, preferences, user]
	// );
};

export { useChatService };
