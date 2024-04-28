"use client";

import { IConversation } from "@/lib/database/models/conversation.model";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useConversations = ({
	onConversationCreated,
	onConversationDeleted,
}: {
	onConversationCreated?: (data: IConversation) => void;
	onConversationDeleted?: () => void;
}) => {
	const { user } = useUser();

	const queryClient = useQueryClient();

	const { isPending, error, data } = useQuery({
		queryKey: ["conversations", user?.id],
		refetchOnWindowFocus: true,
		queryFn: () =>
			fetch("/api/conversations")
				.then((res) => res.json())
				.catch((error) =>
					console.error("Error fetching user conversations:", error)
				),
	});

	const createConversationMutation = useMutation({
		mutationFn: () =>
			fetch(`/api/conversations/foo`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((res) => res.json())
				.catch((error) =>
					console.error("Error creating new conversation:", error)
				),
		onSuccess: (data) => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
			onConversationCreated?.(data);
		},
	});

	const createConversation = () => {
		createConversationMutation.mutate();
	};

	const deleteConversationMutation = useMutation({
		mutationFn: (conversationId: string) =>
			fetch(`/api/conversations/${conversationId}`, {
				method: "DELETE",
			})
				.then((res) => res.json())
				.catch((error) => console.error("Error deleting conversation:", error)),
		onMutate: async (conversationId: string) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["conversations"] });

			// Snapshot the previous value
			const previousConversations: IConversation[] =
				queryClient.getQueryData(["conversations"]) ?? [];

			// Optimistically update to remove the conversation
			queryClient.setQueryData(
				["conversations"],
				previousConversations.filter(
					(conversation: IConversation) => conversation.id !== conversationId
				)
			);

			return { previousConversations };
		},
		onError: (err, variables, context) => {
			// Rollback on error
			queryClient.setQueryData(
				["conversations"],
				context?.previousConversations
			);
		},
		onSettled: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
			onConversationDeleted?.();
		},
	});

	const deleteConversation = (conversationId: string) => {
		deleteConversationMutation.mutate(conversationId);
	};

	const conversations = data?.conversations as IConversation[];

	return {
		isPending,
		error,
		conversations,
		createConversation,
		deleteConversation,
	};
};

export { useConversations };
