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

import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { z } from "zod";
import { ARABIC_DIALECTS } from "@/types/languagesTypes";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";

// export interface IPreferences {
// 	clerkId: string;
// 	arabic_dialect: ArabicDialect;
// 	assistant_language_level: "beginner" | "intermediate" | "native";
// 	assistant_gender: "young_male" | "young_female" | "old_male" | "old_female";
// 	assistant_response_style: "formal" | "informal";
// 	assistant_detail_level: "low" | "medium" | "high";
// 	voice_stability: number;
// 	voice_similarity_boost: number;
// 	voice_style: number;
// 	voice_use_speaker_boost: boolean;
// }

// export const DEFAULT_USER_PREFERENCES: Omit<IPreferences, "clerkId"> = {
// 	arabic_dialect: "Modern Standard Arabic",
// 	assistant_language_level: "intermediate",
// 	assistant_gender: "young_male",
// 	assistant_response_style: "informal",
// 	assistant_detail_level: "medium",
// 	voice_stability: 0.5,
// 	voice_similarity_boost: 0.75,
// 	voice_style: 0,
// 	voice_use_speaker_boost: true,
// };

const preferencesFormSchema = z.object({
	arabic_dialect: z.string(),
	assistant_language_level: z.enum(["beginner", "intermediate", "native"]),
	assistant_gender: z.enum([
		"young_male",
		"young_female",
		"old_male",
		"old_female",
	]),
	assistant_response_style: z.enum(["formal", "informal"]),
	assistant_detail_level: z.enum(["low", "medium", "high"]),
	voice_stability: z.number(),
	voice_similarity_boost: z.number(),
	voice_style: z.number(),
	voice_use_speaker_boost: z.boolean(),
});

const PreferencesPage = () => {
	const {
		isPending,
		error,
		preferences,
		createPreferences,
		updatePreferences,
	} = usePreferences();

	const { user } = useUser();

	console.log("preferences", preferences);

	const form = useForm<z.infer<typeof preferencesFormSchema>>({
		resolver: zodResolver(preferencesFormSchema),
		defaultValues: {
			arabic_dialect:
				preferences?.arabic_dialect ?? DEFAULT_USER_PREFERENCES.arabic_dialect,
			assistant_language_level:
				preferences?.assistant_language_level ??
				DEFAULT_USER_PREFERENCES.assistant_language_level,
			assistant_gender:
				preferences?.assistant_gender ??
				DEFAULT_USER_PREFERENCES.assistant_gender,
			assistant_response_style:
				preferences?.assistant_response_style ??
				DEFAULT_USER_PREFERENCES.assistant_response_style,
			assistant_detail_level:
				preferences?.assistant_detail_level ??
				DEFAULT_USER_PREFERENCES.assistant_detail_level,
			voice_stability:
				preferences?.voice_stability ??
				DEFAULT_USER_PREFERENCES.voice_stability,
			voice_similarity_boost:
				preferences?.voice_similarity_boost ??
				DEFAULT_USER_PREFERENCES.voice_similarity_boost,
			voice_style:
				preferences?.voice_style ?? DEFAULT_USER_PREFERENCES.voice_style,
			voice_use_speaker_boost:
				preferences?.voice_use_speaker_boost ??
				DEFAULT_USER_PREFERENCES.voice_use_speaker_boost,
		},
	});

	console.log("form", form);

	const formSubmitHandler = (values: z.infer<typeof preferencesFormSchema>) => {
		updatePreferences(values);
	};

	useEffect(() => {
		if (!error && !isPending && !preferences && user?.id) {
			createPreferences({
				clerkId: user.id,
				...DEFAULT_USER_PREFERENCES,
			});
		}
	}, [preferences, user, error, isPending]);

	if (isPending) return <div>Loading preferences...</div>;

	if (error) return <div>Error loading preferences: {error.message}</div>;

	console.log("preferences data", preferences);

	const formContent = (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(formSubmitHandler)}>
				<div className="space-y-12">
					<div className="grid grid-cols-1 px-6 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">
								Assistant
							</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">
								Configure your assistant's language
							</p>
						</div>

						<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
							<div className="sm:col-span-4">
								<FormField
									control={form.control}
									name="arabic_dialect"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="block text-sm font-medium leading-6 text-gray-900">
												Arabic Dialect
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
												{...field}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select Dialect" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{ARABIC_DIALECTS.map((dialect) => (
														<SelectItem value={dialect} key={dialect}>
															{dialect}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="sm:col-span-4">
								<FormField
									control={form.control}
									name="assistant_language_level"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel>Language level:</FormLabel>
											<FormControl>
												<RadioGroup
													onValueChange={field.onChange}
													defaultValue={field.value}
													className="flex flex-col space-y-1"
												>
													<FormItem className="flex items-center space-x-3 space-y-0">
														<FormControl>
															<RadioGroupItem value="beginner" />
														</FormControl>
														<FormLabel className="font-normal">
															Beginner
														</FormLabel>
													</FormItem>
													<FormItem className="flex items-center space-x-3 space-y-0">
														<FormControl>
															<RadioGroupItem value="intermediate" />
														</FormControl>
														<FormLabel className="font-normal">
															Intermediate
														</FormLabel>
													</FormItem>
													<FormItem className="flex items-center space-x-3 space-y-0">
														<FormControl>
															<RadioGroupItem value="native" />
														</FormControl>
														<FormLabel className="font-normal">
															Native
														</FormLabel>
													</FormItem>
												</RadioGroup>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="sm:col-span-4">
								<label
									htmlFor="website"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Website
								</label>
								<div className="mt-2">
									<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
										<span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
											http://
										</span>
										<input
											type="text"
											name="website"
											id="website"
											className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
											placeholder="www.example.com"
										/>
									</div>
								</div>
							</div>

							<div className="col-span-full">
								<label
									htmlFor="about"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									About
								</label>
								<div className="mt-2">
									<textarea
										id="about"
										name="about"
										rows={3}
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
										defaultValue={""}
									/>
								</div>
								<p className="mt-3 text-sm leading-6 text-gray-600">
									Write a few sentences about yourself.
								</p>
							</div>

							<div className="col-span-full">
								<label
									htmlFor="photo"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Photo
								</label>
								<div className="mt-2 flex items-center gap-x-3">
									<UserCircleIcon
										className="h-12 w-12 text-gray-300"
										aria-hidden="true"
									/>
									<button
										type="button"
										className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
									>
										Change
									</button>
								</div>
							</div>

							<div className="col-span-full">
								<label
									htmlFor="cover-photo"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Cover photo
								</label>
								<div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
									<div className="text-center">
										<PhotoIcon
											className="mx-auto h-12 w-12 text-gray-300"
											aria-hidden="true"
										/>
										<div className="mt-4 flex text-sm leading-6 text-gray-600">
											<label
												htmlFor="file-upload"
												className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
											>
												<span>Upload a file</span>
												<input
													id="file-upload"
													name="file-upload"
													type="file"
													className="sr-only"
												/>
											</label>
											<p className="pl-1">or drag and drop</p>
										</div>
										<p className="text-xs leading-5 text-gray-600">
											PNG, JPG, GIF up to 10MB
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 px-6 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">
								Personal Information
							</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">
								Use a permanent address where you can receive mail.
							</p>
						</div>

						<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
							<div className="sm:col-span-3">
								<label
									htmlFor="first-name"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									First name
								</label>
								<div className="mt-2">
									<input
										type="text"
										name="first-name"
										id="first-name"
										autoComplete="given-name"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									/>
								</div>
							</div>

							<div className="sm:col-span-3">
								<label
									htmlFor="last-name"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Last name
								</label>
								<div className="mt-2">
									<input
										type="text"
										name="last-name"
										id="last-name"
										autoComplete="family-name"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									/>
								</div>
							</div>

							<div className="sm:col-span-4">
								<label
									htmlFor="email"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Email address
								</label>
								<div className="mt-2">
									<input
										id="email"
										name="email"
										type="email"
										autoComplete="email"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									/>
								</div>
							</div>

							<div className="sm:col-span-3">
								<label
									htmlFor="country"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Country
								</label>
								<div className="mt-2">
									<select
										id="country"
										name="country"
										autoComplete="country-name"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
									>
										<option>United States</option>
										<option>Canada</option>
										<option>Mexico</option>
									</select>
								</div>
							</div>

							<div className="col-span-full">
								<label
									htmlFor="street-address"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Street address
								</label>
								<div className="mt-2">
									<input
										type="text"
										name="street-address"
										id="street-address"
										autoComplete="street-address"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									/>
								</div>
							</div>

							<div className="sm:col-span-2 sm:col-start-1">
								<label
									htmlFor="city"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									City
								</label>
								<div className="mt-2">
									<input
										type="text"
										name="city"
										id="city"
										autoComplete="address-level2"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									/>
								</div>
							</div>

							<div className="sm:col-span-2">
								<label
									htmlFor="region"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									State / Province
								</label>
								<div className="mt-2">
									<input
										type="text"
										name="region"
										id="region"
										autoComplete="address-level1"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									/>
								</div>
							</div>

							<div className="sm:col-span-2">
								<label
									htmlFor="postal-code"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									ZIP / Postal code
								</label>
								<div className="mt-2">
									<input
										type="text"
										name="postal-code"
										id="postal-code"
										autoComplete="postal-code"
										className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 px-6 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">
								Notifications
							</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">
								We'll always let you know about important changes, but you pick
								what else you want to hear about.
							</p>
						</div>

						<div className="max-w-2xl space-y-10 md:col-span-2">
							<fieldset>
								<legend className="text-sm font-semibold leading-6 text-gray-900">
									By Email
								</legend>
								<div className="mt-6 space-y-6">
									<div className="relative flex gap-x-3">
										<div className="flex h-6 items-center">
											<input
												id="comments"
												name="comments"
												type="checkbox"
												className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
											/>
										</div>
										<div className="text-sm leading-6">
											<label
												htmlFor="comments"
												className="font-medium text-gray-900"
											>
												Comments
											</label>
											<p className="text-gray-500">
												Get notified when someones posts a comment on a posting.
											</p>
										</div>
									</div>
									<div className="relative flex gap-x-3">
										<div className="flex h-6 items-center">
											<input
												id="candidates"
												name="candidates"
												type="checkbox"
												className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
											/>
										</div>
										<div className="text-sm leading-6">
											<label
												htmlFor="candidates"
												className="font-medium text-gray-900"
											>
												Candidates
											</label>
											<p className="text-gray-500">
												Get notified when a candidate applies for a job.
											</p>
										</div>
									</div>
									<div className="relative flex gap-x-3">
										<div className="flex h-6 items-center">
											<input
												id="offers"
												name="offers"
												type="checkbox"
												className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
											/>
										</div>
										<div className="text-sm leading-6">
											<label
												htmlFor="offers"
												className="font-medium text-gray-900"
											>
												Offers
											</label>
											<p className="text-gray-500">
												Get notified when a candidate accepts or rejects an
												offer.
											</p>
										</div>
									</div>
								</div>
							</fieldset>
							<fieldset>
								<legend className="text-sm font-semibold leading-6 text-gray-900">
									Push Notifications
								</legend>
								<p className="mt-1 text-sm leading-6 text-gray-600">
									These are delivered via SMS to your mobile phone.
								</p>
								<div className="mt-6 space-y-6">
									<div className="flex items-center gap-x-3">
										<input
											id="push-everything"
											name="push-notifications"
											type="radio"
											className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
										/>
										<label
											htmlFor="push-everything"
											className="block text-sm font-medium leading-6 text-gray-900"
										>
											Everything
										</label>
									</div>
									<div className="flex items-center gap-x-3">
										<input
											id="push-email"
											name="push-notifications"
											type="radio"
											className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
										/>
										<label
											htmlFor="push-email"
											className="block text-sm font-medium leading-6 text-gray-900"
										>
											Same as email
										</label>
									</div>
									<div className="flex items-center gap-x-3">
										<input
											id="push-nothing"
											name="push-notifications"
											type="radio"
											className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
										/>
										<label
											htmlFor="push-nothing"
											className="block text-sm font-medium leading-6 text-gray-900"
										>
											No push notifications
										</label>
									</div>
								</div>
							</fieldset>
						</div>
					</div>
				</div>

				<div className="mt-6 flex items-center justify-end gap-x-6 px-6">
					<button
						type="button"
						className="text-sm font-semibold leading-6 text-gray-900"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Save
					</button>
				</div>
			</form>
		</Form>
	);

	return (
		<div className="lg:h-svh lg:overflow-y-scroll w-full py-6 bg-white">
			{formContent}
		</div>
	);
};

export default PreferencesPage;

// return (
//     <div>
//     <h1>Preferences</h1>
//     {Object.entries(preferences)
//         .filter(([key, value]) => key !== "clerkId" && key !== "_id")
//         .map(([key, value]) => (
//             <div key={key}>
//                 <div>
//                     <strong>{key}</strong>: {value as unknown as string}
//                 </div>
//             </div>
//         ))}
// </div>
// )
