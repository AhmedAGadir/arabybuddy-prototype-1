"use client";

import { useLogger } from "@/hooks/useLogger";
import { usePreferences } from "@/hooks/usePreferences";
import {
	createPreferences,
	getPreferencesById,
} from "@/lib/actions/preferences.actions";
import { DEFAULT_USER_PREFERENCES } from "@/lib/database/models/preferences.model";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// // export interface IPreferences {
// // 	clerkId: string;
// // 	arabic_dialect: ArabicDialect;
// // 	assistant_language_level: "beginner" | "intermediate" | "native";
// // 	assistant_gender: "young_male" | "young_female" | "old_male" | "old_female";
// // 	assistant_response_style: "formal" | "informal";
// // 	assistant_detail_level: "low" | "medium" | "high";
// // 	voice_stability: number;
// // 	voice_similarity_boost: number;
// // 	voice_style: number;
// // 	voice_use_speaker_boost: boolean;
// // }

// // export const DEFAULT_USER_PREFERENCES: Omit<IPreferences, "clerkId"> = {
// // 	arabic_dialect: "Modern Standard Arabic",
// // 	assistant_language_level: "intermediate",
// // 	assistant_gender: "young_male",
// // 	assistant_response_style: "informal",
// // 	assistant_detail_level: "medium",
// // 	voice_stability: 0.5,
// // 	voice_similarity_boost: 0.75,
// // 	voice_style: 0,
// // 	voice_use_speaker_boost: true,
// // };

// const preferencesFormSchema = z.object({
// 	arabic_dialect: z.string(),
// 	assistant_language_level: z.enum(["beginner", "intermediate", "native"]),
// 	assistant_gender: z.enum(["young_male", "young_female", "old_male", "old_female"]),
// 	assistant_response_style: z.enum(["formal", "informal"]),
// 	assistant_detail_level: z.enum(["low", "medium", "high"]),
// 	voice_stability: z.number(),
// 	voice_similarity_boost: z.number(),
// 	voice_style: z.number(),
// 	voice_use_speaker_boost: z.boolean(),
// });

// const PreferencesPage = () => {
// 	const {
// 		isPending,
// 		error,
// 		preferences,
// 		createPreferences,
// 		updatePreferences,
// 	} = usePreferences();

// 	const { user } = useUser();

// 	const form = useForm<z.infer<typeof preferencesFormSchema>>({
// 		resolver: zodResolver(preferencesFormSchema),
// 		defaultValues: preferences,
// 	});

// 	const formSubmitHandler = (values: z.infer<typeof preferencesFormSchema>) => {
// 		debugger;
// 		updatePreferences(values);
// 	};

// 	useEffect(() => {
// 		if (!error && !isPending && !preferences && user?.id) {
// 			createPreferences({
// 				clerkId: user.id,
// 				...DEFAULT_USER_PREFERENCES,
// 			});
// 		}
// 	}, [preferences, user, error, isPending]);

// 	if (isPending) return <div>Loading preferences...</div>;

// 	if (error) return <div>Error loading preferences: {error.message}</div>;

// 	console.log("preferences data", preferences);

// 	return (
// 		<Form {...form}>
// 			<form
// 				onSubmit={form.handleSubmit(formSubmitHandler)}
// 				className="space-y-6 md:space-y-8"
// 			>
// 				<FormField
// 					control={form.control}
// 					name="arabic_dialect"
// 					render={({ field }) => (
// 						<FormItem>
// 							<FormLabel>Arabic Dialect</FormLabel>
// 							<Select
// 								onValueChange={field.onChange}
// 								defaultValue={field.value}
// 								{...field}
// 							>
// 								<FormControl>
// 									<SelectTrigger className="w-full md:w-[250px] mx-auto">
// 										<SelectValue placeholder="Select Dialect" />
// 									</SelectTrigger>
// 								</FormControl>
// 								<SelectContent>
// 									{ARABIC_DIALECTS.map((dialect) => (
// 										<SelectItem value={dialect} key={dialect}>
// 											{dialect}
// 										</SelectItem>
// 									))}
// 								</SelectContent>
// 							</Select>
// 							<FormMessage>{form.formState.errors.arabic_dialect?.message}</FormMessage>
// 						</FormItem>
// 					)}
// 				</FormField>
// 			</form>

// 	)
// };

// export default PreferencesPage;

const PreferencesPage = () => {
	const {
		isPending,
		error,
		preferences,
		createPreferences,
		updatePreferences,
	} = usePreferences();

	const { user } = useUser();

	if (!user || isPending) return <div>Loading preferences...</div>;

	if (error) return <div>Error loading preferences: {error.message}</div>;

	console.log("preferences data", preferences);

	return (
		<div>
			<h1>Preferences</h1>
			{Object.entries(preferences)
				.filter(([key, value]) => key !== "clerkId" && key !== "_id")
				.map(([key, value]) => (
					<div key={key}>
						<div>
							<strong>{key}</strong>: {value}
						</div>
					</div>
				))}
		</div>
	);
};

export default PreferencesPage;
