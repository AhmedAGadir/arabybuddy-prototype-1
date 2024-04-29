"use client";

import { IMessage } from "@/lib/database/models/message.model";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLogger } from "./useLogger";

const useMessages = ({ conversationId }: { conversationId: string }) => {
	const logger = useLogger({ label: "useMessages", color: "#a5ff90" });

	const { user } = useUser();

	const queryClient = useQueryClient();

	const {
		isPending,
		error,
		data: messages,
		refetch,
	} = useQuery({
		queryKey: ["messages", user?.id, conversationId],
		refetchOnWindowFocus: true,
		queryFn: async () => {
			logger.log("fetching messages for conversationId", conversationId);
			const response = await fetch(
				`/api/conversations/${conversationId}/messages`
			);
			const data = await response.json();
			return data.messages;
		},
	});

	const createMessageMutation = useMutation({
		mutationFn: async ({
			content,
			role,
		}: Pick<IMessage, "role" | "content">) => {
			logger.log("creating message for conversationId", conversationId);
			const response = await fetch(
				`/api/conversations/${conversationId}/messages`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ content, role }),
				}
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		// // When mutate is called:
		// onMutate: async ({ content, role }: Pick<IMessage, "role" | "content">) => {
		// 	// Cancel any outgoing refetches
		// 	// (so they don't overwrite our optimistic update)
		// 	await queryClient.cancelQueries({ queryKey: ["messages"] });

		// 	// Snapshot the previous value
		// 	const previousMessages = queryClient.getQueryData(["messages"]) ?? [];

		// 	// Optimistically update to the new value
		// 	queryClient.setQueryData(["messages"], (old: IMessage[] = []) => [
		// 		...old,
		// 		{ content, role },
		// 	]);

		// 	// Return a context object with the snapshotted value
		// 	return { previousMessages };
		// },
		// // If the mutation fails,
		// // use the context returned from onMutate to roll back
		// onError: (err, newMessage, context) => {
		// 	queryClient.setQueryData(["messages"], context?.previousMessages ?? []);
		// },
		// Always refetch after error or success:
		onSettled: () => {
			logger.log("message created, invalidating cache now");
			queryClient.invalidateQueries({ queryKey: ["messages"] });
		},
	});

	const createMessage = async ({
		content,
		role,
	}: Pick<IMessage, "role" | "content">) => {
		await createMessageMutation.mutateAsync({ content, role });
	};

	const deleteAllMessagesAfterTimeStampMutation = useMutation({
		mutationFn: async (timestamp: Date) => {
			logger.log("deleting all messages after timestamp", timestamp);
			const response = await fetch(
				`/api/conversations/${conversationId}/messages`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ timestamp: timestamp.toISOString() }),
				}
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		onSettled: () => {
			logger.log("messages deleted, invalidating cache now");
			queryClient.invalidateQueries({ queryKey: ["messages"] });
		},
	});

	const deleteAllMessagesAfterTimeStamp = async (timestamp: Date) => {
		await deleteAllMessagesAfterTimeStampMutation.mutateAsync(timestamp);
	};

	return {
		isPending,
		error,
		messages: (messages ?? []) as IMessage[],
		refetch,
		createMessage,
		deleteAllMessagesAfterTimeStamp,
	};
};

export { useMessages };
