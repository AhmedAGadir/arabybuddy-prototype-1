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
	const controllerRef = useRef<AbortController>();

	const { user } = useUser();

	const { preferences } = usePreferences();

	const makeChatCompletion = useCallback(
		async (
			messageHistory: OpenAIMessage[],
			options: { mode: CompletionMode }
		) => {
			try {
				const params = {
					messageHistory,
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

				const decoder = new TextDecoder();

				let content = "";

				for await (const chunk of res.body as any) {
					const decodedChunk = decoder.decode(chunk, { stream: true });
					content += decodedChunk;
				}

				const latestMessage = messageHistory[messageHistory.length - 1];

				let role: "assistant" | "user";

				if (
					options.mode === completionMode.TRANSLATE ||
					options.mode === completionMode.REPHRASE
				) {
					role = latestMessage.role;
				} else {
					role = "assistant";
				}

				const completionMessage: OpenAIMessage = {
					role,
					content,
				};

				return { completionMessage };

				// alternative way to read the response body
				// const reader = res.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>;
				// const decoder = new TextDecoder();
				// const loopRunner = true;

				// while (loopRunner) {
				// 	// Here we start reading the stream, until its done.
				// 	const { value, done } = await reader.read();
				// 	if (done) {
				// 		break;
				// 	}
				// 	const decodedChunk = decoder.decode(value, { stream: true });
				// 	// do something
				// }
			} catch (error) {
				logger.error("Failed to add chat message", error);
				throw error;
			}
		},
		[logger, preferences, user?.firstName]
	);

	const abortMakeChatCompletion = useCallback(() => {
		logger.log("aborting request");
		controllerRef.current?.abort();
		controllerRef.current = undefined;
	}, [logger]);

	return { makeChatCompletion, abortMakeChatCompletion };
};

export { useChatService };
