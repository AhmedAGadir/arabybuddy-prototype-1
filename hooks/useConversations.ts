"use client";

import { IConversation } from "@/lib/database/models/conversation.model";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLogger } from "./useLogger";

const useConversations = () => {
	const logger = useLogger({ label: "useConversations", color: "#55ff37" });
	const { user } = useUser();

	const queryClient = useQueryClient();

	const queryKey = ["conversations", user?.id];

	const { isPending, error, data, refetch } = useQuery({
		queryKey,
		refetchOnWindowFocus: true,
		queryFn: async () => {
			logger.log("fetching conversations...");
			const response = await fetch("/api/conversations");
			const data = await response.json();
			logger.log("fetched conversations", data);
			return data;
		},
	});

	const createConversationMutation = useMutation({
		mutationFn: async () => {
			logger.log("creating conversation...");
			// throw new Error("test");
			const response = await fetch(`/api/conversations`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			logger.log("conversation created", data);
			return data;
		},
		onError: (err) => {
			logger.error("Error creating conversation:", err);
			throw err;
		},
		onSuccess: (data) => {
			// Invalidate and refetch
			logger.log("created conversation - invalidating cache and refetching...");
			queryClient.invalidateQueries({
				queryKey,
			});
		},
		// TODO: cancel outgoing fetches when creating a conversation
	});

	const createConversation = async () => {
		return await createConversationMutation.mutateAsync();
	};

	const isCreatingConversation = createConversationMutation.isPending;

	const deleteConversationMutation = useMutation({
		mutationFn: async (conversationId: string) => {
			logger.log("deleting conversation...", conversationId);
			const response = await fetch(`/api/conversations/${conversationId}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			logger.log("conversation deleted", data);
			return data;
		},
		onMutate: async (conversationId) => {
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
			logger.error("Error deleting conversation:", err);
			// Rollback on error
			queryClient.setQueryData(
				["conversations"],
				context?.previousConversations ?? ""
			);
		},
		onSettled: () => {
			// Invalidate and refetch
			logger.log("deleted conversation - invalidating cache and refetching...");
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const deleteConversation = async (conversationId: string) => {
		return await deleteConversationMutation.mutateAsync(conversationId);
	};

	const updateConversationMutation = useMutation({
		mutationFn: async (
			conversation: Pick<IConversation, "_id"> & Partial<IConversation>
		) => {
			logger.log("updating conversation...", conversation);
			const response = await fetch(`/api/conversations/${conversation._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ conversation }),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			logger.log("conversation updated", data);
			return data;
		},
		onError: (err, variables, context) => {
			logger.error("Error updating conversation:", err);
			return err;
		},
		onSettled: () => {
			// Invalidate and refetch
			logger.log(
				"updating conversation - invalidating cache and refetching..."
			);
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const updateConversation = async (
		updatedConversation: Pick<IConversation, "_id"> & Partial<IConversation>
	) => {
		return await updateConversationMutation.mutateAsync(updatedConversation);
	};

	const conversations = data?.conversations as IConversation[];

	return {
		isPending,
		error,
		conversations,
		refetch,
		createConversation,
		deleteConversation,
		updateConversation,
		isCreatingConversation,
	};
};

export { useConversations };
