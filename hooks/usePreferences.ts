import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLogger } from "./useLogger";
import { useUser } from "@clerk/nextjs";
import { IPreferences } from "@/lib/database/models/preferences.model";

const usePreferences = () => {
	const logger = useLogger({ label: "usePreferences", color: "#709dff" });

	const { user } = useUser();

	const queryClient = useQueryClient();

	const { isPending, error, data, refetch } = useQuery({
		queryKey: ["preferences", user?.id],
		refetchOnWindowFocus: true,
		queryFn: async () => {
			const response = await fetch("/api/preferences");
			const data = await response.json();
			logger.log("fetched preferences", JSON.stringify(data));
			return data;
		},
	});

	const createPreferencesMutation = useMutation({
		mutationFn: async (preferences: IPreferences) => {
			logger.log("creating preferences", preferences);
			const response = await fetch(`/api/preferences`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ preferences }),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		},
		onError: (err) => {
			logger.error("Error creating preferences:", err);
			throw err;
		},
		onSuccess: (data) => {
			// Invalidate and refetch
			logger.log("created preferences - invalidating cache and refetching");
			queryClient.invalidateQueries({ queryKey: ["preferences", user?.id] });
		},
	});

	const createPreferences = async (preferences: IPreferences) => {
		return await createPreferencesMutation.mutateAsync(preferences);
	};

	const updatePreferencesMutation = useMutation({
		mutationFn: async (preferences: IPreferences) => {
			logger.log("updating preferences", JSON.stringify(preferences));
			const response = await fetch(`/api/preferences`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ preferences }),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return response.json();
		},
		onError: (err: Error) => {
			logger.error("Error updating preferences:", err);
			return err;
		},
		onSuccess: (data: IPreferences) => {
			logger.log("updated preferences - invalidating cache and refetching");
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["preferences", user?.id] });
		},
	});

	const updatePreferences = async (preferences: IPreferences) => {
		return await updatePreferencesMutation.mutateAsync(preferences);
	};

	const preferences = data?.preferences as IPreferences;

	return {
		isPending,
		error,
		preferences,
		refetch,
		createPreferences,
		updatePreferences,
	};
};

export { usePreferences };
