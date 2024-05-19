"use client";

import { IMessage } from "@/lib/database/models/message.model";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLogger } from "./useLogger";
import { useTypewriter } from "./useTypewriter";
import { CompletionMode, completionMode } from "@/lib/api/assistant";

const useMessages = ({ conversationId }: { conversationId: string }) => {
	const logger = useLogger({ label: "useMessages", color: "#a5ff90" });

	const { user } = useUser();

	const queryClient = useQueryClient();

	const queryKey = ["messages", user?.id, conversationId];

	const { isPending, error, data, refetch, isLoading } = useQuery({
		queryKey,
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
		mutationFn: async (message: Partial<IMessage>) => {
			logger.log("creating message...");
			const response = await fetch(
				`/api/conversations/${conversationId}/messages`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(message),
				}
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			logger.log("messaged created", data);
			return data;
		},
		onMutate: async (message) => {
			await queryClient.cancelQueries({ queryKey });

			// Snapshot the previous value
			const previousMessages = queryClient.getQueryData(queryKey) ?? [];

			// Optimistically update to the new value
			logger.log("optimistically updating messages...");
			queryClient.setQueryData(queryKey, (old: IMessage[] = []) => [
				...old,
				message,
			]);

			// const setTypedContent = (value: string) => {
			// 	queryClient.setQueryData(
			// 		queryKey,
			// 		(old: IMessage[] = []) => [...old, message]
			// 	);
			// };

			// await typewriter(content, setTypedContent, 30);

			// Return a context object with the snapshotted value
			return { previousMessages };
		},
		onError: (err, newMessage, context) => {
			queryClient.setQueryData(queryKey, context?.previousMessages ?? []);
		},
		onSettled: () => {
			logger.log("message created, invalidating cache....");
			queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const createMessage = async (message: Partial<IMessage>) => {
		return await createMessageMutation.mutateAsync(message);
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
				queryKey,
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
			options: { mode: CompletionMode };
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
		onMutate: async ({ message, options }) => {
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousMessages = queryClient.getQueryData(queryKey) ?? [];

			const isTranslating = options.mode === completionMode.TRANSLATE;

			// Optimistically update to the new value
			logger.log("optimistically updating messages...");
			queryClient.setQueryData(queryKey, (old: IMessage[] = []) =>
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

			// Return a context object with the snapshotted value
			return { previousMessages };
		},
		onSettled: () => {
			logger.log("message updated, invalidating cache...");
			queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const updateMessage = async (
		message: Pick<IMessage, "_id" | "content"> & Partial<IMessage>,
		options: { mode: CompletionMode } = { mode: completionMode.DEFAULT }
	) => {
		return await updateMessageMutation.mutateAsync({ message, options });
	};

	const upsertInCacheMutation = useMutation({
		// we dont need a mutationFn here since we are just updating the cache
		mutationFn: async () => {},
		onMutate: async (message: Partial<IMessage>) => {
			await queryClient.cancelQueries({ queryKey });

			// Snapshot the previous value
			const previousMessages =
				queryClient.getQueryData<IMessage[]>(queryKey) ?? [];

			const messageInd = previousMessages.findIndex(
				(m) => m._id === message._id
			);

			const updatedMessages =
				messageInd === -1
					? [...previousMessages, message]
					: previousMessages.map((m) => (m._id === message._id ? message : m));

			queryClient.setQueryData(queryKey, updatedMessages);

			// Return a context object with the snapshotted value
			return { previousMessages };
		},
		onError: (err, message, context) => {
			queryClient.setQueryData(queryKey, context?.previousMessages ?? []);
		},
	});

	const upsertMessageInCache = async (message: Partial<IMessage>) => {
		return await upsertInCacheMutation.mutateAsync(message);
	};

	const messages = (data ?? []) as IMessage[];

	return {
		isPending,
		error,
		messages,
		refetch,
		createMessage,
		updateMessage,
		deleteMessages,
		upsertMessageInCache,
		isLoading,
	};
};

export { useMessages };
