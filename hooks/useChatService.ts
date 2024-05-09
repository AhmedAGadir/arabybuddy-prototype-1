import { useCallback } from "react";
import { useLogger } from "./useLogger";
import { useServerlessRequest } from "./useServerlessRequest";
import { IMessage } from "@/lib/database/models/message.model";
import { usePreferences } from "./usePreferences";
import { DEFAULT_USER_PREFERENCES } from "@/lib/database/models/preferences.model";
import { useUser } from "@clerk/nextjs";
import { OpenAIMessage } from "@/app/api/chat/assistant/route";

const useChatService = () => {
	const logger = useLogger({ label: "ChatService", color: "#fe7de9" });

	const { makeServerlessRequest, abortRequest: abortMakeChatCompletion } =
		useServerlessRequest();

	const { user } = useUser();

	const { preferences } = usePreferences();

	const makeChatCompletion = useCallback(
		async (
			messageHistory: OpenAIMessage[],
			options: { mode: "regenerate" | "rephrase" | "translate" } | undefined
		) => {
			try {
				const params = {
					messageHistory,
					mode: options?.mode,
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
				logger.log("making request to: /api/chat/assistant...", params);
				const { messages: updatedMessages } = await makeServerlessRequest(
					"/api/chat/assistant",
					{ ...params }
				);

				logger.log("updatedMessages", updatedMessages);

				return { messages: updatedMessages as IMessage[] };
			} catch (error) {
				logger.error("Failed to add chat message", error);
				throw error;
			}
		},
		[
			logger,
			makeServerlessRequest,
			preferences?.arabic_dialect,
			preferences?.assistant_detail_level,
			preferences?.assistant_language_level,
			preferences?.assistant_tone,
			preferences?.user_interests,
			preferences?.user_personality_traits,
			user?.firstName,
		]
	);

	return { makeChatCompletion, abortMakeChatCompletion };
};

export { useChatService };
