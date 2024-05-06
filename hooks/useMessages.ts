"use client";

import { IMessage } from "@/lib/database/models/message.model";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLogger } from "./useLogger";
import { useTypewriter } from "./useTypewriter";

const useMessages = ({ conversationId }: { conversationId: string }) => {
	const logger = useLogger({ label: "useMessages", color: "#a5ff90" });

	const { user } = useUser();

	const queryClient = useQueryClient();

	const { typewriter } = useTypewriter();

	const {
		isPending,
		error,
		data: messages,
		refetch,
	} = useQuery({
		queryKey: ["messages", user?.id, conversationId],
		refetchOnWindowFocus: true,
		queryFn: async () => {
			logger.log("fetching messages...");
			const response = await fetch(
				`/api/conversations/${conversationId}/messages`
			);
			const data = await response.json();
			logger.log("messages fetched", data.messages);
			return data.messages;
		},
	});

	const createMessageMutation = useMutation({
		mutationFn: async ({
			content,
			role,
		}: Pick<IMessage, "role" | "content">) => {
			logger.log("creating message...");
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
			const data = await response.json();
			logger.log("messaged created", data);
			return data;
		},
		// When mutate is called:
		onMutate: async ({ content, role }: Pick<IMessage, "role" | "content">) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: ["messages", user?.id, conversationId],
			});

			// Snapshot the previous value
			const previousMessages =
				queryClient.getQueryData(["messages", user?.id, conversationId]) ?? [];

			// Optimistically update to the new value
			logger.log("optimistically updating messages...");
			// queryClient.setQueryData(
			// 	["messages", user?.id, conversationId],
			// 	(old: IMessage[] = []) => [...old, { content, role }]
			// );

			const setTypedContent = (value: string) => {
				queryClient.setQueryData(
					["messages", user?.id, conversationId],
					(old: IMessage[] = []) => [...old, { content: value, role }]
				);
			};

			await typewriter(content, setTypedContent, 30);

			//

			// Return a context object with the snapshotted value
			return { previousMessages };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newMessage, context) => {
			queryClient.setQueryData(
				["messages", user?.id, conversationId],
				context?.previousMessages ?? []
			);
		},
		// Always refetch after error or success:
		onSettled: () => {
			logger.log("message created, invalidating cache....");
			queryClient.invalidateQueries({
				queryKey: ["messages", user?.id, conversationId],
			});
		},
	});

	const createMessage = async ({
		content,
		role,
	}: Pick<IMessage, "role" | "content">) => {
		return await createMessageMutation.mutateAsync({ content, role });
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
			const data = await response.json();
			logger.log("deleted messages", data);
			return data;
		},
		onSettled: () => {
			logger.log("messages deleted, invalidating cache...");
			queryClient.invalidateQueries({
				queryKey: ["messages", user?.id, conversationId],
			});
		},
	});

	const deleteAllMessagesAfterTimeStamp = async (timestamp: Date) => {
		return await deleteAllMessagesAfterTimeStampMutation.mutateAsync(timestamp);
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
