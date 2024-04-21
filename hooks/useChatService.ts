import { useCallback } from "react";
import { useLogger } from "./useLogger";
import { useServerlessRequest } from "./useServerlessRequest";
import { ChatMessage } from "@/types/messageTypes";

const useChatService = (chatHistory: ChatMessage[]) => {
	const logger = useLogger({ label: "ChatService", color: "#fe7de9" });

	const { makeServerlessRequest, abortRequest: abortAddChatMessageRequest } =
		useServerlessRequest();

	const addChatMessage = useCallback(
		async (latestChatMessage: ChatMessage) => {
			try {
				logger.log("making request to: /api/chat/assistant...");
				const { chatHistory: updatedChatHistory } = await makeServerlessRequest(
					"/api/chat/assistant",
					{
						chatHistory,
						latestChatMessage,
					}
				);

				logger.log("updatedChatHistory", JSON.stringify(updatedChatHistory));

				return { chatHistory: updatedChatHistory };
			} catch (error) {
				logger.error("Failed to add chat message", error);
				throw error;
			}
		},
		[chatHistory, logger, makeServerlessRequest]
	);

	return { addChatMessage, abortAddChatMessageRequest };
};

export { useChatService };
