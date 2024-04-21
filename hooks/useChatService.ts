import { useCallback } from "react";
import { useLogger } from "./useLogger";
import { useServerlessRequest } from "./useServerlessRequest";
import { ChatMessage } from "@/types/messageTypes";

const useChatService = (chatHistory: ChatMessage[]) => {
	const logger = useLogger({ label: "ChatService", color: "#fe7de9" });

	const { makeServerlessRequest, abortRequest: cancelAddChatMessageRequest } =
		useServerlessRequest();

	const addChatMessage = useCallback(
		async (latestChatMessage: ChatMessage) => {
			logger.log("making request to: /api/chat/assistant...");
			console.log("adding chat message", latestChatMessage, chatHistory);

			const { chatHistory: updatedChatHistory } = await makeServerlessRequest(
				"/api/chat/assistant",
				{
					chatHistory,
					latestChatMessage,
				}
			);

			logger.log("updatedChatHistory", JSON.stringify(updatedChatHistory));

			return { chatHistory: updatedChatHistory };
		},
		[chatHistory, logger, makeServerlessRequest]
	);

	return { addChatMessage, cancelAddChatMessageRequest };
};

export { useChatService };
