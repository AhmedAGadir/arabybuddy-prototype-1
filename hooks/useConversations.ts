"use client";

import { IConversation } from "@/lib/database/models/conversation.model";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useConversations = ({
	onConversationDeleted,
}: {
	onConversationDeleted?: () => void;
} = {}) => {
	const { user } = useUser();

	const queryClient = useQueryClient();

	const { isPending, error, data } = useQuery({
		queryKey: ["conversations", user?.id],
		refetchOnWindowFocus: true,
		queryFn: async () => {
			const response = await fetch("/api/conversations");
			const data = await response.json();
			return data;
		},
	});

	const createConversationMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch(`/api/conversations`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		onError: (err) => {
			console.error("Error creating conversation:", err);
			throw err;
		},
		onSuccess: (data) => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
		},
		// TODO: cancel outgoing fetches when creating a conversation
	});

	const createConversation = async () => {
		return await createConversationMutation.mutateAsync();
	};

	const deleteConversationMutation = useMutation({
		mutationFn: async (conversationId: string) => {
			const response = await fetch(`/api/conversations/${conversationId}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
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
					(conversation: IConversation) => conversation._id !== conversationId
				)
			);

			return { previousConversations };
		},
		onError: (err, variables, context) => {
			// Rollback on error
			queryClient.setQueryData(
				["conversations"],
				context?.previousConversations ?? ""
			);
		},
		onSettled: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
			onConversationDeleted?.();
		},
	});

	const deleteConversation = async (conversationId: string) => {
		await deleteConversationMutation.mutateAsync(conversationId);
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
