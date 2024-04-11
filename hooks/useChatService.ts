import { useCallback } from "react";
import { ChatMessage } from "@/app/(root)/chat/page";
import { makeServerlessRequest } from "@/lib/utils";
import { useLogger } from "./useLogger";

const useChatService = (chatHistory: ChatMessage[]) => {
	const logger = useLogger({ label: "ChatService", color: "#fe7de9" });

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

	return { addChatMessage };
};

export { useChatService };
