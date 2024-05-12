"use client";

import { IMessage } from "@/lib/database/models/message.model";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLogger } from "./useLogger";
import { useTypewriter } from "./useTypewriter";
import { OpenAIMessage } from "@/lib/api/assistant";

const useMessages = ({ conversationId }: { conversationId: string }) => {
	const logger = useLogger({ label: "useMessages", color: "#a5ff90" });

	const { user } = useUser();

	const queryClient = useQueryClient();

	const { completeTyping, typewriter } = useTypewriter();

	const { isPending, error, data, refetch } = useQuery({
		queryKey: ["messages", user?.id, conversationId],
		refetchOnWindowFocus: true,
		initialData: [],
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
		mutationFn: async ({ content, role }: OpenAIMessage) => {
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
		onMutate: async ({ content, role }: OpenAIMessage) => {
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
			queryClient.setQueryData(
				["messages", user?.id, conversationId],
				(old: IMessage[] = []) => [...old, { content, role }]
			);

			// const setTypedContent = (value: string) => {
			// 	queryClient.setQueryData(
			// 		["messages", user?.id, conversationId],
			// 		(old: IMessage[] = []) => [...old, { content: value, role }]
			// 	);
			// };

			// await typewriter(content, setTypedContent, 30);

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

	const createMessage = async ({ content, role }: OpenAIMessage) => {
		return await createMessageMutation.mutateAsync({ content, role });
	};

	const deleteMessagesMutation = useMutation({
		mutationFn: async (messageIds: string[]) => {
			logger.log("deleting messages...", messageIds);
			const response = await fetch(
				`/api/conversations/${conversationId}/messages`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ messageIds }),
				}
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			logger.log("messages deleted", data);
			return data;
		},
		onSettled: () => {
			logger.log("messages deleted, invalidating cache...");
			queryClient.invalidateQueries({
				queryKey: ["messages", user?.id, conversationId],
			});
		},
	});

	const deleteMessages = async (messageIds: string[]) => {
		return await deleteMessagesMutation.mutateAsync(messageIds);
	};

	const updateMessageMutation = useMutation({
		mutationFn: async ({
			message,
		}: {
			message: Pick<IMessage, "_id" | "content"> & Partial<IMessage>;
			options: { translate?: boolean };
		}) => {
			logger.log("updating message...", message);
			const response = await fetch(
				`/api/conversations/${conversationId}/messages/${message._id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ message }),
				}
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			logger.log("message updated", data);
			return data;
		},
		onError: (err, message) => {
			logger.error("Error updating message:", err);
			return err;
		},
		onMutate: async ({
			message,
			options,
		}: {
			message: Pick<IMessage, "_id" | "content"> & Partial<IMessage>;
			options: { translate?: boolean };
		}) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: ["messages", user?.id, conversationId],
			});

			// Snapshot the previous value
			const previousMessages =
				queryClient.getQueryData(["messages", user?.id, conversationId]) ?? [];

			const isTranslating = options.translate;

			// Optimistically update to the new value
			logger.log("optimistically updating messages...");
			queryClient.setQueryData(
				["messages", user?.id, conversationId],
				(old: IMessage[] = []) =>
					old.map((m) =>
						m._id === message._id
							? {
									...m,
									translation: isTranslating
										? message.translation
										: m.translation,
									content: isTranslating ? m.content : message.content,
							  }
							: m
					)
			);

			// const isTranslating = options.translate;

			// const textToType = isTranslating
			// 	? message.translation ?? ""
			// 	: message.content;

			// const setTypedContent = (value: string) => {
			// 	queryClient.setQueryData(
			// 		["messages", user?.id, conversationId],
			// 		(old: IMessage[] = []) =>
			// 			old.map((m) =>
			// 				m._id === message._id
			// 					? {
			// 							...m,
			// 							translation: isTranslating ? value : m.translation,
			// 							content: isTranslating ? m.content : value,
			// 					  }
			// 					: m
			// 			)
			// 	);
			// };

			// await typewriter(textToType, setTypedContent, 30);

			// Return a context object with the snapshotted value
			return { previousMessages };
		},
		onSettled: () => {
			logger.log("message updated, invalidating cache...");
			queryClient.invalidateQueries({
				queryKey: ["messages", user?.id, conversationId],
			});
		},
	});

	const updateMessage = async (
		message: Pick<IMessage, "_id" | "content"> & Partial<IMessage>,
		options: { translate?: boolean } = {}
	) => {
		return await updateMessageMutation.mutateAsync({ message, options });
	};

	return {
		isPending,
		error,
		messages: data as IMessage[],
		refetch,
		createMessage,
		updateMessage,
		completeTyping,
		deleteMessages,
	};
};

export { useMessages };
