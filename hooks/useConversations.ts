import { IConversation } from "@/lib/database/models/conversation.model";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const useConversations = () => {
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
			fetch("/api/conversations/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: user?.id, // Clerk user ID
				}),
			})
				.then((res) => res.json())
				.catch((error) =>
					console.error("Error creating new conversation:", error)
				),
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
		},
	});

	const createConversation = () => {
		createConversationMutation.mutate();
	};

	const conversations = data?.conversations as IConversation[];

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
		},
	});

	const deleteConversation = (conversationId: string) => {
		deleteConversationMutation.mutate(conversationId);
	};

	return {
		isPending,
		error,
		conversations,
		createConversation,
		deleteConversation,
	};
};

export { useConversations };
