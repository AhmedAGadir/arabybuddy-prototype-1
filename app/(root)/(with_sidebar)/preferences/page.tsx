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
import {
	RadioGroup as RadioGroupRadix,
	RadioGroupItem as RadioGroupItemRadix,
} from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

// export interface IPreferences {
// 	clerkId: string;
// 	arabic_dialect: ArabicDialect;
// 	assistant_language_level: "beginner" | "intermediate" | "native";
// 	assistant_gender: "young_male" | "young_female" | "old_male" | "old_female";
// 	assistant_tone: "casual" | "professional";
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
// 	assistant_tone: "casual",
// 	assistant_detail_level: "medium",
// 	voice_stability: 0.5,
// 	voice_similarity_boost: 0.75,
// 	voice_style: 0,
// 	voice_use_speaker_boost: true,
// };

const preferencesFormSchema = z.object({
	arabic_dialect: z.enum(ARABIC_DIALECTS),
	assistant_language_level: z.enum(["beginner", "intermediate", "native"]),
	assistant_gender: z.enum([
		"young_male",
		"young_female",
		"old_male",
		"old_female",
	]),
	assistant_tone: z.enum(["casual", "professional"]),
	assistant_detail_level: z.enum(["low", "medium", "high"]),
	voice_stability: z.number(),
	voice_similarity_boost: z.number(),
	voice_style: z.number(),
	voice_use_speaker_boost: z.boolean(),
});

const PreferencesPage = () => {
	const logger = useLogger({
		label: "PreferencesPage",
		color: "#00ffb3",
	});
	const [preferencesInitialized, setPreferencesInitialized] =
		React.useState(false);
	const {
		isPending,
		error,
		preferences,
		createPreferences,
		updatePreferences,
	} = usePreferences();

	// TODO: useToast, handle errors, loading states, saving state etc.

	const { user } = useUser();

	const form = useForm<z.infer<typeof preferencesFormSchema>>({
		resolver: zodResolver(preferencesFormSchema),
		// defaultValues: {
		// 	arabic_dialect: DEFAULT_USER_PREFERENCES.arabic_dialect,
		// 	assistant_language_level:
		// 		DEFAULT_USER_PREFERENCES.assistant_language_level,
		// 	assistant_gender: DEFAULT_USER_PREFERENCES.assistant_gender,
		// 	assistant_tone: DEFAULT_USER_PREFERENCES.assistant_tone,
		// 	assistant_detail_level: DEFAULT_USER_PREFERENCES.assistant_detail_level,
		// 	voice_stability: DEFAULT_USER_PREFERENCES.voice_stability,
		// 	voice_similarity_boost: DEFAULT_USER_PREFERENCES.voice_similarity_boost,
		// 	voice_style: DEFAULT_USER_PREFERENCES.voice_style,
		// 	voice_use_speaker_boost: DEFAULT_USER_PREFERENCES.voice_use_speaker_boost,
		// },
	});

	useEffect(() => {
		logger.log("mounted");
	}, []);

	useEffect(() => {
		if (!isPending && !error && preferences && !preferencesInitialized) {
			console.log("resetting");
			// Update form default values
			form.reset({
				arabic_dialect: preferences.arabic_dialect,
				assistant_language_level: preferences.assistant_language_level,
				assistant_gender: preferences.assistant_gender,
				assistant_tone: preferences.assistant_tone,
				assistant_detail_level: preferences.assistant_detail_level,
				voice_stability: preferences.voice_stability,
				voice_similarity_boost: preferences.voice_similarity_boost,
				voice_style: preferences.voice_style,
				voice_use_speaker_boost: preferences.voice_use_speaker_boost,
			});
			setPreferencesInitialized(true);
		}
	}, [isPending, error, preferences, form]);

	// Watch all inputs in the form
	// const formState = form.watch();

	// useEffect(() => {
	// 	// Log the form state whenever it changes
	// 	// console.log("Form state:", formState);
	// }, [formState]);

	const formSubmitHandler = (values: z.infer<typeof preferencesFormSchema>) => {
		updatePreferences({
			...preferences,
			...values,
		});
	};

	// useEffect(() => {
	// 	if (!error && !isPending && !preferences && user?.id) {
	// 		createPreferences({
	// 			clerkId: user.id,
	// 			...DEFAULT_USER_PREFERENCES,
	// 		});
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [preferences, user, error, isPending]);

	if (isPending) return <div>Loading preferences...</div>;

	if (!preferencesInitialized) return <div>Initializing preferences...</div>;

	if (error) return <div>Error loading preferences: {error.message}</div>;

	const formContent = (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(formSubmitHandler)}>
				<div className="space-y-12">
					<div className="grid grid-cols-1 px-6 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">
								Personalisation
							</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">
								Configure your assistant&apos;s language, style, and gender to
								match your preferences. Adjust how formally they speak and the
								level of detail they provide.
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
												// {...field}
											>
												<FormControl>
													<SelectTrigger className="focus:ring-indigo-600">
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

							<div className="sm:col-span-6">
								<FormField
									control={form.control}
									name="assistant_language_level"
									render={({ field }) => {
										return (
											<FormItem className="space-y-3">
												<RadioGroup
													value={field.value}
													onChange={field.onChange}
													defaultValue={field.value}
												>
													<RadioGroup.Label className="block text-sm font-medium leading-6 text-gray-900">
														Language Level
													</RadioGroup.Label>

													<div
														// className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4"
														className="mt-2 flex flex-col md:flex-row gap-2"
													>
														{[
															{
																id: "beginner",
																title: "Beginner",
																description:
																	"You are just starting to learn the dialect",
															},
															{
																id: "intermediate",
																title: "Intermediate",
																description:
																	"You have some experience with the dialect",
															},
															{
																id: "native",
																title: "Native",
																description:
																	"You are a native speaker of the dialect",
															},
														].map((languageLevel) => (
															<RadioGroup.Option
																key={languageLevel.id}
																value={languageLevel.id}
																className={({ active }) =>
																	cn(
																		active
																			? "border-indigo-600 ring-2 ring-indigo-600"
																			: "border-gray-300",
																		"relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
																	)
																}
															>
																{({ checked, active }) => (
																	<>
																		<span className="flex flex-1">
																			<span className="flex flex-col">
																				<RadioGroup.Label
																					as="span"
																					className="block text-sm font-medium text-gray-900"
																				>
																					{languageLevel.title}
																				</RadioGroup.Label>
																				<RadioGroup.Description
																					as="span"
																					className="mt-1 flex items-center text-sm text-gray-500"
																				>
																					{languageLevel.description}
																				</RadioGroup.Description>
																			</span>
																		</span>
																		<CheckCircleIcon
																			className={cn(
																				!checked ? "invisible" : "",
																				"h-5 w-5 text-indigo-600"
																			)}
																			aria-hidden="true"
																		/>
																		<span
																			className={cn(
																				active ? "border" : "border-2",
																				checked
																					? "border-indigo-600"
																					: "border-transparent",
																				"pointer-events-none absolute -inset-px rounded-lg"
																			)}
																			aria-hidden="true"
																		/>
																	</>
																)}
															</RadioGroup.Option>
														))}
													</div>
												</RadioGroup>
												<FormMessage />
											</FormItem>
										);
									}}
								/>
							</div>

							<div className="sm:col-span-6">
								<FormField
									control={form.control}
									name="assistant_tone"
									render={({ field }) => {
										return (
											<FormItem className="space-y-3">
												<RadioGroup
													value={field.value}
													onChange={field.onChange}
													defaultValue={field.value}
												>
													<RadioGroup.Label className="block text-sm font-medium leading-6 text-gray-900">
														Interaction Tone
													</RadioGroup.Label>

													<div
														// className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4"
														className="mt-2 flex flex-col md:flex-row gap-2"
													>
														{[
															{
																id: "casual",
																title: "Casual",
																description:
																	"Your assistant will speak to you in a casual manner",
															},
															{
																id: "professional",
																title: "Professional",
																description:
																	"Your assistant will speak to you in a professional manner",
															},
														].map((tone) => (
															<RadioGroup.Option
																key={tone.id}
																value={tone.id}
																className={({ active }) =>
																	cn(
																		active
																			? "border-indigo-600 ring-2 ring-indigo-600"
																			: "border-gray-300",
																		"relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
																	)
																}
															>
																{({ checked, active }) => (
																	<>
																		<span className="flex flex-1">
																			<span className="flex flex-col">
																				<RadioGroup.Label
																					as="span"
																					className="block text-sm font-medium text-gray-900"
																				>
																					{tone.title}
																				</RadioGroup.Label>
																				<RadioGroup.Description
																					as="span"
																					className="mt-1 flex items-center text-sm text-gray-500"
																				>
																					{tone.description}
																				</RadioGroup.Description>
																			</span>
																		</span>
																		<CheckCircleIcon
																			className={cn(
																				!checked ? "invisible" : "",
																				"h-5 w-5 text-indigo-600"
																			)}
																			aria-hidden="true"
																		/>
																		<span
																			className={cn(
																				active ? "border" : "border-2",
																				checked
																					? "border-indigo-600"
																					: "border-transparent",
																				"pointer-events-none absolute -inset-px rounded-lg"
																			)}
																			aria-hidden="true"
																		/>
																	</>
																)}
															</RadioGroup.Option>
														))}
													</div>
												</RadioGroup>
												<FormMessage />
											</FormItem>
										);
									}}
								/>
							</div>

							{/* <div className="sm:col-span-6">
								<FormField
									control={form.control}
									name="assistant_detail_level"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<RadioGroup
												value={field.value}
												onChange={field.onChange}
												defaultValue={field.value}
											>
												<RadioGroup.Label className="block text-sm font-medium leading-6 text-gray-900">
													Response Detail
												</RadioGroup.Label>

												<div className="mt-2 flex flex-col md:flex-row gap-2">
													{[
														{
															id: "low",
															title: "Low",
															description:
																"Your assistant will provide minimal detail",
														},
														{
															id: "medium",
															title: "Medium",
															description:
																"Your assistant will provide moderate detail",
														},
														{
															id: "high",
															title: "High",
															description:
																"Your assistant will provide maximum detail",
														},
													].map((detail) => (
														<RadioGroup.Option
															key={detail.id}
															value={detail.id}
															className={({ active }) =>
																cn(
																	active
																		? "border-indigo-600 ring-2 ring-indigo-600"
																		: "border-gray-300",
																	"relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
																)
															}
														>
															{({ checked, active }) => (
																<>
																	<span className="flex flex-1">
																		<span className="flex flex-col">
																			<RadioGroup.Label
																				as="span"
																				className="block text-sm font-medium text-gray-900"
																			>
																				{detail.title}
																			</RadioGroup.Label>
																			<RadioGroup.Description
																				as="span"
																				className="mt-1 flex items-center text-sm text-gray-500"
																			>
																				{detail.description}
																			</RadioGroup.Description>
																		</span>
																	</span>
																	<CheckCircleIcon
																		className={cn(
																			!checked ? "invisible" : "",
																			"h-5 w-5 text-indigo-600"
																		)}
																		aria-hidden="true"
																	/>
																	<span
																		className={cn(
																			active ? "border" : "border-2",
																			checked
																				? "border-indigo-600"
																				: "border-transparent",
																			"pointer-events-none absolute -inset-px rounded-lg"
																		)}
																		aria-hidden="true"
																	/>
																</>
															)}
														</RadioGroup.Option>
													))}
												</div>
											</RadioGroup>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div> */}

							<div className="sm:col-span-6">
								<FormField
									control={form.control}
									name="assistant_gender"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<RadioGroup
												value={field.value}
												onChange={field.onChange}
												defaultValue={field.value}
											>
												<RadioGroup.Label className="block text-sm font-medium leading-6 text-gray-900">
													Character Profile
												</RadioGroup.Label>

												<div className="mt-2 flex flex-col md:flex-row gap-2">
													{[
														{
															id: "young_male",
															title: "Young - Man",
															description:
																"Your assistant will personify a young man.",
														},
														{
															id: "young_female",
															title: "Young - Woman",
															description:
																"Your assistant will personify a young woman.",
														},
														{
															id: "old_male",
															title: "Old - Man",
															description:
																"Your assistant will personify an older man.",
														},
														{
															id: "old_female",
															title: "Old - Woman",
															description:
																"Your assistant will personify an older woman.",
														},
													].map((gender) => (
														<RadioGroup.Option
															key={gender.id}
															value={gender.id}
															className={({ active }) =>
																cn(
																	active
																		? "border-indigo-600 ring-2 ring-indigo-600"
																		: "border-gray-300",
																	"relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
																)
															}
														>
															{({ checked, active }) => (
																<>
																	<span className="flex flex-1">
																		<span className="flex flex-col">
																			<RadioGroup.Label
																				as="span"
																				className="block text-sm font-medium text-gray-900"
																			>
																				{gender.title}
																			</RadioGroup.Label>
																			<RadioGroup.Description
																				as="span"
																				className="mt-1 flex items-center text-sm text-gray-500"
																			>
																				{gender.description}
																			</RadioGroup.Description>
																		</span>
																	</span>
																	<CheckCircleIcon
																		className={cn(
																			!checked ? "invisible" : "",
																			"h-5 w-5 text-indigo-600"
																		)}
																		aria-hidden="true"
																	/>
																	<span
																		className={cn(
																			active ? "border" : "border-2",
																			checked
																				? "border-indigo-600"
																				: "border-transparent",
																			"pointer-events-none absolute -inset-px rounded-lg"
																		)}
																		aria-hidden="true"
																	/>
																</>
															)}
														</RadioGroup.Option>
													))}
												</div>
											</RadioGroup>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="sm:col-span-6">
								<FormField
									control={form.control}
									name="assistant_detail_level"
									render={({ field }) => {
										return (
											<FormItem className="space-y-3">
												<RadioGroup
													value={field.value}
													onChange={field.onChange}
													defaultValue={field.value}
												>
													<RadioGroup.Label className="block text-sm font-medium leading-6 text-gray-900">
														Response Detail
													</RadioGroup.Label>

													<div
														// className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4"
														className="mt-2 flex flex-col md:flex-row gap-2"
													>
														{[
															{
																id: "low",
																title: "Low",
																available: true,
															},
															{
																id: "medium",
																title: "Medium",
																available: true,
															},
															{
																id: "high",
																title: "High",
																available: true,
															},
														].map((detail) => (
															<RadioGroup.Option
																key={detail.id}
																value={detail.id}
																className={({ active, checked }) =>
																	cn(
																		detail.available
																			? "cursor-pointer focus:outline-none"
																			: "cursor-not-allowed opacity-25",
																		active
																			? "ring-2 ring-indigo-600 ring-offset-2"
																			: "",
																		checked
																			? "bg-indigo-600 text-white hover:bg-indigo-500"
																			: "ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50",
																		"flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold sm:flex-1"
																	)
																}
																disabled={!detail.available}
															>
																<RadioGroup.Label as="span">
																	{detail.title}
																</RadioGroup.Label>
															</RadioGroup.Option>
														))}
													</div>
												</RadioGroup>
												<FormMessage />
											</FormItem>
										);
									}}
								/>
							</div>

							{/* <div className="sm:col-span-6">
								<FormField
									control={form.control}
									name="assistant_gender"
									render={({ field }) => {
										return (
											<FormItem className="space-y-3">
												<RadioGroup
													value={field.value}
													onChange={field.onChange}
													defaultValue={field.value}
												>
													<RadioGroup.Label className="block text-sm font-medium leading-6 text-gray-900">
														Character Profile
													</RadioGroup.Label>

													<div
														// className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4"
														className="mt-2 flex flex-col md:flex-row gap-2"
													>
														{[
															{
																id: "young_male",
																title: "Young - Man",
																available: true,
															},
															{
																id: "young_female",
																title: "Young - Woman",
																available: true,
															},
															{
																id: "old_male",
																title: "Old - Man",
																available: true,
															},
															{
																id: "old_female",
																title: "Old - Woman",
																available: true,
															},
														].map((gender) => (
															<RadioGroup.Option
																key={gender.id}
																value={gender.id}
																className={({ active, checked }) =>
																	cn(
																		gender.available
																			? "cursor-pointer focus:outline-none"
																			: "cursor-not-allowed opacity-25",
																		active
																			? "ring-2 ring-indigo-600 ring-offset-2"
																			: "",
																		checked
																			? "bg-indigo-600 text-white hover:bg-indigo-500"
																			: "ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50",
																		"flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold sm:flex-1"
																	)
																}
																disabled={!gender.available}
															>
																<RadioGroup.Label as="span">
																	{gender.title}
																</RadioGroup.Label>
															</RadioGroup.Option>
														))}
													</div>
												</RadioGroup>
												<FormMessage />
											</FormItem>
										);
									}}
								/>
							</div> */}
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
								We&apos;ll always let you know about important changes, but you
								pick what else you want to hear about.
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
					{/* TODO: reset to default button - ghost/link, on the other side */}
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
		<div className="lg:h-svh lg:overflow-y-scroll w-full py-6 bg-white ">
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
