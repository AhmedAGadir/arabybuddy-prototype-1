import { useLogger } from "./useLogger";
import { usePreferences } from "./usePreferences";
import { DEFAULT_USER_PREFERENCES } from "@/lib/database/models/preferences.model";
import { useUser } from "@clerk/nextjs";
import {
	CompletionMode,
	OpenAIMessage,
	completionMode,
} from "@/lib/api/assistant";
import { useServerlessRequest } from "./useServerlessRequest";
import { AssistantPayload } from "@/app/api/chat/assistant/route";
import { ArabicDialect } from "@/types/types";
import { ChatPartnerId } from "@/lib/chatPartners";

const useChatService = () => {
	const logger = useLogger({ label: "ChatService", color: "#fe7de9" });

	const { makeServerlessRequest, abortRequest: abortMakeChatCompletionStream } =
		useServerlessRequest();

	const { user } = useUser();
	const { preferences } = usePreferences();

	async function* makeChatCompletionGenerator(
		messages: OpenAIMessage[],
		params: {
			mode: CompletionMode;
			chatPartnerId: ChatPartnerId;
			chatDialect: ArabicDialect;
		}
	) {
		try {
			const payload: AssistantPayload = {
				messages,
				mode: params.mode,
				chat: {
					chatPartnerId: params.chatPartnerId,
					chatDialect: params.chatDialect,
				},
				user: {
					firstName: user?.firstName ?? undefined,
				},
				preferences: {
					assistant_language_level:
						preferences.assistant_language_level ??
						DEFAULT_USER_PREFERENCES.assistant_language_level,
					assistant_detail_level:
						preferences.assistant_detail_level ??
						DEFAULT_USER_PREFERENCES.assistant_detail_level,
					user_interests:
						preferences.user_interests ??
						DEFAULT_USER_PREFERENCES.user_interests,
				},
			};

			logger.log("making request to: /api/chat/assistant...", payload);

			const res = await makeServerlessRequest("/api/chat/assistant", payload);

			if (!res.ok) {
				throw new Error(`HTTP error status: ${res.status}`);
			}

			const reader =
				res.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>;
			const decoder = new TextDecoder();

			let role: "assistant" | "user";

			if (params.mode === "DEFAULT") {
				role = "assistant";
			} else {
				role = messages[messages.length - 1].role;
			}

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

	const makeChatCompletionStream = async (
		messageHistory: OpenAIMessage[],
		params: {
			mode?: CompletionMode;
			chatPartnerId: ChatPartnerId;
			chatDialect: ArabicDialect;
		}
	) =>
		makeChatCompletionGenerator(messageHistory, {
			mode: params.mode ?? "DEFAULT",
			chatPartnerId: params.chatPartnerId,
			chatDialect: params.chatDialect,
		});

	return { makeChatCompletionStream, abortMakeChatCompletionStream };

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
