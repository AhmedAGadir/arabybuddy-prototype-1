import { useCallback } from "react";
import { useLogger } from "./useLogger";
import { useServerlessRequest } from "./useServerlessRequest";
import { IMessage } from "@/lib/database/models/message.model";

const useChatService = () => {
	const logger = useLogger({ label: "ChatService", color: "#fe7de9" });

	const { makeServerlessRequest, abortRequest: abortMakeChatCompletion } =
		useServerlessRequest();

	const makeChatCompletion = useCallback(
		async (
			latestChatMessage: Pick<IMessage, "role" | "content">,
			messages: Pick<IMessage, "role" | "content">[]
		) => {
			try {
				logger.log("making request to: /api/chat/assistant...");
				const { messages: updatedMessages } = await makeServerlessRequest(
					"/api/chat/assistant",
					{
						messages,
						latestChatMessage,
					}
				);

				logger.log("updatedMessages", JSON.stringify(updatedMessages));

				return { messages: updatedMessages };
			} catch (error) {
				logger.error("Failed to add chat message", error);
				throw error;
			}
		},
		[logger, makeServerlessRequest]
	);

	return { makeChatCompletion, abortMakeChatCompletion };
};

export { useChatService };
