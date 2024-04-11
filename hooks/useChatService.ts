import { useCallback } from "react";
import { ChatMessage } from "@/app/(root)/chat/page";
import { useLogger } from "./useLogger";
import { useServerlessRequest } from "./useServerlessRequest";

const useChatService = (chatHistory: ChatMessage[]) => {
	const logger = useLogger({ label: "ChatService", color: "#fe7de9" });

	const { makeServerlessRequest, abortRequest: cancelAddChatMessageRequest } =
		useServerlessRequest();

	const addChatMessage = useCallback(
		async (latestChatMessage: ChatMessage) => {
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
		},
		[chatHistory, logger]
	);

	return { addChatMessage, cancelAddChatMessageRequest };
};

export { useChatService };
