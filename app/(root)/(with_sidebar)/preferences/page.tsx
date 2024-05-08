"use client";

import { useLogger } from "@/hooks/useLogger";
import { usePreferences } from "@/hooks/usePreferences";
import {
	DEFAULT_USER_PREFERENCES,
	IPreferences,
} from "@/lib/database/models/preferences.model";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useState } from "react";
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

import { z } from "zod";
import { ARABIC_DIALECTS } from "@/types/types";
import {
	RadioGroup as RadioGroupRadix,
	RadioGroupItem as RadioGroupItemRadix,
} from "@radix-ui/react-radio-group";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SkewLoader from "react-spinners/SkewLoader";
import MoonLoader from "react-spinners/MoonLoader";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import { ToastAction } from "@radix-ui/react-toast";
import { Badge } from "@/components/ui/badge";

const FormSection = ({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) => (
	<div className="grid grid-cols-1 px-6 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
		<div>
			<h2 className="text-base font-semibold leading-7 text-gray-900">
				{title}
			</h2>
			<p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
		</div>
		<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
			{children}
		</div>
	</div>
);

const INTERESTS = {
	["Activity & Wellness"]: [
		{ value: "Basketball", icon: "🏀" },
		{ value: "Bird Watching", icon: "🦆" },
		{ value: "Boxing", icon: "🥊" },
		{ value: "Calisthenics", icon: "🤸" },
		{ value: "Camping", icon: "🏕️" },
		{ value: "Cycling", icon: "🚴" },
		{ value: "Football", icon: "⚽" },
		{ value: "Gardening", icon: "🌱" },
		{ value: "Hiking", icon: "🥾" },
		{ value: "Martial Arts", icon: "🥋" },
		{ value: "Pilates", icon: "🤸" },
		{ value: "Rock Climbing", icon: "🧗" },
		{ value: "Running", icon: "🏃" },
		{ value: "Skiing", icon: "⛷️" },
		{ value: "Soccer", icon: "🏐" },
		{ value: "Swimming", icon: "🏊" },
		{ value: "Tennis", icon: "🎾" },
		{ value: "Yoga", icon: "🧘" },
	],
	["Arts & Culture"]: [
		{ value: "Anime", icon: "🎌" },
		{ value: "Board Games", icon: "🎲" },
		{ value: "Cinema", icon: "🎬" },
		{ value: "Classical Music", icon: "🎻" },
		{ value: "Dance", icon: "💃" },
		{ value: "Design", icon: "🎨" },
		{ value: "DIY", icon: "🛠️" },
		{ value: "Language Learning", icon: "🗣️" },
		{ value: "Museums", icon: "🏛" },
		{ value: "Opera", icon: "🎶" },
		{ value: "Painting", icon: "🎨" },
		{ value: "Photography", icon: "📷" },
		{ value: "Reading", icon: "📚" },
		{ value: "Sculpture", icon: "🗿" },
		{ value: "Theater", icon: "🎭" },
		{ value: "TV Shows", icon: "📺" },
	],
	["Education & Technology"]: [
		{ value: "Animation", icon: "🎞️" },
		{ value: "Blogging", icon: "✍️" },
		{ value: "Coding", icon: "💻" },
		{ value: "Content Creation", icon: "🎥" },
		{ value: "Educational Workshops", icon: "🏫" },
		{ value: "Entrepreneurship", icon: "🚀" },
		{ value: "Live Streaming", icon: "🎙️" },
		{ value: "Online Learning", icon: "🌐" },
		{ value: "Video Games", icon: "🎮" },
	],
	["Community & Social"]: [
		{ value: "Animal Welfare", icon: "🐾" },
		{ value: "Charity Work", icon: "❤️" },
		{ value: "Community Service", icon: "🏘️" },
		{ value: "Environmentalism", icon: "🌍" },
		{ value: "Event Planning", icon: "🎉" },
		{ value: "Fundraising", icon: "💸" },
		{ value: "Politics", icon: "🏛️" },
		{ value: "Public Speaking", icon: "🎙️" },
		{ value: "Social Activism", icon: "✊" },
		{ value: "Volunteering", icon: "🤲" },
	],
	["Lifestyle"]: [
		{ value: "Beauty & Makeup", icon: "💄" },
		{ value: "Cooking", icon: "🍳" },
		{ value: "Fashion", icon: "👗" },
		{ value: "Foodie", icon: "🍽" },
		{ value: "Home Decor", icon: "🏠" },
		{ value: "Pet Care", icon: "🐕" },
		{ value: "Thrifting", icon: "👗" },
		{ value: "Travel", icon: "✈️" },
		{ value: "Wellness", icon: "🧘" },
	],
	["Spirituality & Religion"]: [
		{ value: "Buddhism", icon: "☸️" },
		{ value: "Christianity", icon: "✝️" },
		{ value: "Hinduism", icon: "🕉️" },
		{ value: "Islam", icon: "☪️" },
		{ value: "Judaism", icon: "✡️" },
		{ value: "Meditation", icon: "🧘" },
		{ value: "Philosophy", icon: "🔍" },
		{ value: "Spiritual Studies", icon: "📿" },
	],
};

const PERSONALITY_TRAITS = [
	{ value: "Adventurous", icon: "🚀" },
	{ value: "Animal Lover", icon: "🐶" },
	{ value: "Bookworm", icon: "📖" },
	{ value: "Calm", icon: "🌊" },
	{ value: "Carefree", icon: "🍃" },
	{ value: "Cheerful", icon: "😄" },
	{ value: "Competitive", icon: "🏆" },
	{ value: "Conservative", icon: "🔒" },
	{ value: "Creative", icon: "🌈" },
	{ value: "Driven", icon: "🚗" },
	{ value: "Entrepreneurial", icon: "💼" },
	{ value: "Empathetic", icon: "💞" },
	{ value: "ENFJ", icon: "🎤" },
	{ value: "ENFP", icon: "🎨" },
	{ value: "ENTJ", icon: "👔" },
	{ value: "ENTP", icon: "💡" },
	{ value: "ESFJ", icon: "👩‍👧‍👦" },
	{ value: "ESFP", icon: "🕺" },
	{ value: "ESTJ", icon: "🏢" },
	{ value: "ESTP", icon: "🏂" },
	{ value: "Extroverted", icon: "🤝" },
	{ value: "Family-oriented", icon: "👨‍👩‍👧" },
	{ value: "Fashionable", icon: "👗" },
	{ value: "Generous", icon: "🎁" },
	{ value: "Humorous", icon: "😂" },
	{ value: "Imaginative", icon: "💭" },
	{ value: "Independent", icon: "🏝️" },
	{ value: "INFJ", icon: "🌟" },
	{ value: "INFP", icon: "🌼" },
	{ value: "INTJ", icon: "🧠" },
	{ value: "INTP", icon: "🔍" },
	{ value: "Introverted", icon: "🏠" },
	{ value: "ISFJ", icon: "💖" },
	{ value: "ISFP", icon: "🎸" },
	{ value: "ISTJ", icon: "📚" },
	{ value: "ISTP", icon: "🔧" },
	{ value: "Liberal", icon: "🕊️" },
	{ value: "Logical", icon: "🖥️" },
	{ value: "Loyal", icon: "🐾" },
	{ value: "Nerdy", icon: "🤓" },
	{ value: "Night Owl", icon: "🦉" },
	{ value: "Optimistic", icon: "☀️" },
	{ value: "Organized", icon: "🗂️" },
	{ value: "Outdoorsy", icon: "🌲" },
	{ value: "Passionate", icon: "🔥" },
	{ value: "Patient", icon: "⏳" },
	{ value: "Practical", icon: "🔨" },
	{ value: "Religious", icon: "🙏" },
	{ value: "Romantic", icon: "❤️" },
	{ value: "Sociable", icon: "🍹" },
	{ value: "Spiritual", icon: "✨" },
];

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
	voice_stability: z.number().refine((value) => value >= 0.3, {
		message: "Values under 30% may lead to instability",
	}),
	voice_similarity_boost: z.number(),
	voice_style: z.number().refine((value) => value <= 0.5, {
		message: "Values over 50% may lead to instability",
	}),
	voice_use_speaker_boost: z.boolean(),
	user_interests: z
		.array(z.string())
		.max(15, "You can only select up to 15 interests"),
	user_personality_traits: z
		.array(z.string())
		.max(6, "You can only select up to 6 personality traits"),
});

const PreferencesPage = () => {
	const logger = useLogger({
		label: "PreferencesPage",
		color: "#00ffb3",
	});
	const {
		isPending,
		error,
		preferences,
		refetch,
		createPreferences,
		updatePreferences,
	} = usePreferences();

	// TODO: implement confirmation dialog before navigating away from unsaved changes

	const { user } = useUser();

	const { toast } = useToast();

	const form = useForm<z.infer<typeof preferencesFormSchema>>({
		resolver: zodResolver(preferencesFormSchema),
	});

	useEffect(() => {
		// Update form values after preferences are loaded
		if (!isPending && !error && preferences) {
			form.reset({
				arabic_dialect:
					preferences.arabic_dialect ?? DEFAULT_USER_PREFERENCES.arabic_dialect,
				assistant_language_level:
					preferences.assistant_language_level ??
					DEFAULT_USER_PREFERENCES.assistant_language_level,
				assistant_gender:
					preferences.assistant_gender ??
					DEFAULT_USER_PREFERENCES.assistant_gender,
				assistant_tone:
					preferences.assistant_tone ?? DEFAULT_USER_PREFERENCES.assistant_tone,
				assistant_detail_level:
					preferences.assistant_detail_level ??
					DEFAULT_USER_PREFERENCES.assistant_detail_level,
				voice_stability:
					preferences.voice_stability ??
					DEFAULT_USER_PREFERENCES.voice_stability,
				voice_similarity_boost:
					preferences.voice_similarity_boost ??
					DEFAULT_USER_PREFERENCES.voice_similarity_boost,
				voice_style:
					preferences.voice_style ?? DEFAULT_USER_PREFERENCES.voice_style,
				voice_use_speaker_boost:
					preferences.voice_use_speaker_boost ??
					DEFAULT_USER_PREFERENCES.voice_use_speaker_boost,
				user_interests:
					preferences.user_interests ?? DEFAULT_USER_PREFERENCES.user_interests,
				user_personality_traits:
					preferences.user_personality_traits ??
					DEFAULT_USER_PREFERENCES.user_personality_traits,
			});
		}
	}, [isPending, error, preferences, form]);

	useEffect(() => {
		if (!isPending && error) {
			toast({
				title: "Error loading preferences",
				description: "An error occurred while loading your preferences",
				action: (
					<ToastAction altText="Try again">
						<Button variant="outline" onClick={() => refetch()}>
							Try again
						</Button>
					</ToastAction>
				),
				className: "error-toast",
				duration: Infinity,
			});
		}
	}, [isPending, error, refetch, toast]);

	// TODO: remove after everyone's migrated
	useEffect(() => {
		if (!error && !isPending && !preferences && user?.id) {
			createPreferences({
				clerkId: user.id,
				...DEFAULT_USER_PREFERENCES,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [preferences, user, error, isPending]);

	// *** for debugging purposes ***
	// Watch all inputs in the form
	const formState = form.watch();

	useEffect(() => {
		// Log the form state whenever it changes
		logger.log("Form state:", formState);
	}, [formState, logger]);

	const formSubmitHandler = async (
		values: z.infer<typeof preferencesFormSchema>
	) => {
		try {
			logger.log("submitting form", values);

			await updatePreferences({
				...preferences,
				...values,
			});
			toast({
				title: "Preferences saved",
				description: "Your preferences have been saved successfully",
				className: "success-toast",
			});
		} catch (error) {
			toast({
				title: "Error saving preferences",
				description: "An error occurred while saving your preferences",
				className: "error-toast",
			});
			logger.error("Error saving preferences", error);
		}
	};

	const cancelHandler = () => {
		form.reset();
	};

	const [resetToDefaultDialogOpen, setResetToDefaultDialogOpen] =
		useState(false);

	const resetToDefaultHandler = () => {
		setResetToDefaultDialogOpen(true);
	};

	const onResetToDefaultConfirmed = async () => {
		try {
			await updatePreferences({
				...preferences,
				...DEFAULT_USER_PREFERENCES,
			});
			toast({
				title: "Preferences reset",
				description: "Your preferences have been reset to default",
				className: "success-toast",
			});
		} catch (error) {
			toast({
				title: "Error resetting preferences",
				description: "An error occurred while resetting your preferences",
				className: "error-toast",
			});
			logger.error("Error resetting preferences", error);
		}
		setResetToDefaultDialogOpen(false);
	};

	const formStateEqualToDefaultPreferences = useMemo(() => {
		if (!preferences) return false;
		const formValues = form.getValues();
		return Object.keys(formValues).every(
			(key) =>
				(formValues as IPreferences)[key as keyof typeof preferences] ===
				(DEFAULT_USER_PREFERENCES as IPreferences)[
					key as keyof typeof preferences
				]
		);
	}, [form, preferences]);

	if (isPending) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-screen min-h-svh ">
				<SkewLoader
					color="black"
					loading
					size={20}
					aria-label="Loading Spinner"
					data-testid="loader"
				/>
			</div>
		);
	}

	if (error) {
		return null;
	}

	const formContent = (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(formSubmitHandler)}
				className="relative"
			>
				{/* overlay when submitting */}
				{form.formState.isSubmitting && (
					<div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10"></div>
				)}
				{/* form */}
				<div className="space-y-12">
					<FormSection
						title="Dialect & Proficiency"
						description="Select your preferred Arabic dialect and define your proficiency
								level for tailored communication with your assistant."
					>
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
											// value={field.value}
											// defaultValue={field.value}
											{...field}
											key={field.value}
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
					</FormSection>

					<FormSection
						title="Assistant Interaction Style"
						description="Customize how your assistant interacts with you by setting your
								assistant profile, response style, and detail level."
					>
						<div className="sm:col-span-4">
							<FormField
								control={form.control}
								name="assistant_gender"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="block text-sm font-medium leading-6 text-gray-900">
											Assistant Profile
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											{...field}
											key={field.value}
										>
											<FormControl>
												<SelectTrigger className="focus:ring-indigo-600">
													<SelectValue placeholder="Select Profile" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{[
													{
														id: "young_male",
														title: "Youthful / Man",
													},
													{
														id: "young_female",
														title: "Youthful / Woman",
													},
													{
														id: "old_male",
														title: "Middle-aged / Man",
													},
													{
														id: "old_female",
														title: "Middle-aged / Woman",
													},
												].map(({ id, title }) => (
													<SelectItem value={id} key={id}>
														{title}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* <FormField
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
												Profile
											</RadioGroup.Label>

											<div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
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
											<FormMessage />
										</RadioGroup>
									</FormItem>
								)}
							/> */}
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
													Response Style
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
													Detail Level
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
					</FormSection>

					<FormSection
						title="Assistant Voice Customization"
						description="Fine-tune the technical aspects of your assistant's voice to suit your auditory preferences."
					>
						<div className="sm:col-span-6">
							<FormField
								control={form.control}
								name="voice_stability"
								render={({ field }) => {
									return (
										<FormItem className="space-y-3">
											<FormLabel className="block text-sm font-medium leading-6 text-gray-900">
												Stability
											</FormLabel>
											<div>
												<div className="flex justify-between pb-2">
													<span className="text-sm text-gray-500">
														More variable
													</span>
													<span className="text-sm text-gray-500">
														More stable
													</span>
												</div>
												<Slider
													min={0}
													max={100}
													step={1}
													value={[field.value * 100]}
													onValueChange={(value) => {
														form.trigger(field.name);
														field.onChange(value[0] / 100);
													}}
													defaultValue={[field.value]}
												/>
											</div>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						</div>

						<div className="sm:col-span-6">
							<FormField
								control={form.control}
								name="voice_similarity_boost"
								render={({ field }) => {
									return (
										<FormItem className="space-y-3">
											<FormLabel className="block text-sm font-medium leading-6 text-gray-900">
												Similarity
											</FormLabel>
											<div>
												<div className="flex justify-between pb-2">
													<span className="text-sm text-gray-500">Low</span>
													<span className="text-sm text-gray-500">High</span>
												</div>
												<Slider
													min={0}
													max={100}
													step={1}
													value={[field.value * 100]}
													onValueChange={(value) => {
														form.trigger(field.name);
														field.onChange(value[0] / 100);
													}}
													defaultValue={[field.value]}
												/>
											</div>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						</div>

						<div className="sm:col-span-6">
							<FormField
								control={form.control}
								name="voice_style"
								render={({ field }) => {
									return (
										<FormItem className="space-y-3">
											<FormLabel className="block text-sm font-medium leading-6 text-gray-900">
												Style Exaggeration
											</FormLabel>
											<div>
												<div className="flex justify-between pb-2">
													<span className="text-sm text-gray-500">None</span>
													<span className="text-sm text-gray-500">
														Exaggerated
													</span>
												</div>
												<Slider
													min={0}
													max={100}
													step={1}
													value={[field.value * 100]}
													onValueChange={(value) => {
														form.trigger(field.name);
														field.onChange(value[0] / 100);
													}}
													defaultValue={[field.value]}
												/>
											</div>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						</div>

						<div className="sm:col-span-6">
							<FormField
								control={form.control}
								name="voice_use_speaker_boost"
								render={({ field }) => {
									return (
										<FormItem className="space-y-3 relative">
											<Label
												htmlFor="voice_use_speaker_boost"
												className="block text-sm font-medium leading-6 text-gray-900"
											>
												Speaker Boost
											</Label>
											<Switch
												id="voice_use_speaker_boost"
												checked={field.value}
												defaultChecked={field.value}
												onCheckedChange={field.onChange}
											/>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						</div>
					</FormSection>

					<FormSection
						title="Interests and Personality"
						description="Share your interests and personality traits to enhance your assistant's ability to provide personalized and relevant interactions."
					>
						<div className="sm:col-span-6">
							<FormField
								control={form.control}
								name="user_interests"
								render={({ field }) => {
									return (
										<FormItem>
											<div>
												<FormLabel className="block text-md font-medium leading-6 text-gray-900">
													Interests
												</FormLabel>
												<div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
													{Object.entries(INTERESTS).map(
														([category, interests]) => (
															<div key={category}>
																<FormLabel className="block text-sm font-medium leading-6 text-gray-900 mb-2">
																	{category}
																</FormLabel>
																<div className="flex flex-wrap gap-2">
																	{interests.map((interest) => (
																		<Badge
																			className={cn(
																				"cursor-pointer",
																				(field.value ?? []).includes(
																					interest.value
																				)
																					? "bg-indigo-600 hover:bg-indigo-400"
																					: "hover:bg-indigo-400 hover:text-primary-foreground"
																			)}
																			key={interest.value}
																			variant={
																				(field.value ?? []).includes(
																					interest.value
																				)
																					? "default"
																					: "secondary"
																			}
																			onClick={() => {
																				const index = field.value.indexOf(
																					interest.value
																				);
																				if (index === -1) {
																					field.onChange([
																						...field.value,
																						interest.value,
																					]);
																				} else {
																					field.onChange([
																						...field.value.slice(0, index),
																						...field.value.slice(index + 1),
																					]);
																				}
																				form.trigger(field.name);
																			}}
																		>
																			{interest.icon} {interest.value}
																		</Badge>
																	))}
																</div>
															</div>
														)
													)}
												</div>
											</div>

											<FormMessage />
										</FormItem>
									);
								}}
							/>
						</div>

						<div className="sm:col-span-6">
							<FormField
								control={form.control}
								name="user_personality_traits"
								render={({ field }) => {
									return (
										<FormItem>
											<div>
												<FormLabel className="block text-md font-medium leading-6 text-gray-900">
													Personality Traits
												</FormLabel>
												<div className="mt-2 flex flex-wrap gap-2">
													{PERSONALITY_TRAITS.map((trait) => (
														<Badge
															className={cn(
																"cursor-pointer",
																(field.value ?? []).includes(trait.value)
																	? "bg-indigo-600 hover:bg-indigo-400"
																	: "hover:bg-indigo-400 hover:text-primary-foreground"
															)}
															key={trait.value}
															variant={
																(field.value ?? []).includes(trait.value)
																	? "default"
																	: "secondary"
															}
															onClick={() => {
																const index = field.value.indexOf(trait.value);
																if (index === -1) {
																	field.onChange([...field.value, trait.value]);
																} else {
																	field.onChange([
																		...field.value.slice(0, index),
																		...field.value.slice(index + 1),
																	]);
																}
																form.trigger(field.name);
															}}
														>
															{trait.icon} {trait.value}
														</Badge>
													))}
												</div>
											</div>

											<FormMessage />
										</FormItem>
									);
								}}
							/>
						</div>
					</FormSection>
				</div>

				<div className="mt-6 flex flex-col-reverse md:flex-row items-center justify-end gap-x-6 gap-y-4 px-6">
					<Button
						type="button"
						variant="ghost"
						size="lg"
						className="w-full md:w-fit text-sm font-semibold leading-6 text-gray-900"
						onClick={resetToDefaultHandler}
						disabled={
							form.formState.isSubmitting || formStateEqualToDefaultPreferences
						}
					>
						Reset to Default
					</Button>
					<Button
						type="button"
						variant="outline"
						size="lg"
						className="w-full md:w-fit text-sm font-semibold leading-6 text-gray-900"
						onClick={cancelHandler}
						disabled={form.formState.isSubmitting || !form.formState.isDirty}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						size="lg"
						// TODO: standardize button styles and sizes - make a tailwind utility class
						className="w-full md:w-fit rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						disabled={form.formState.isSubmitting || !form.formState.isDirty}
					>
						{!form.formState.isSubmitting && <span>Save</span>}
						{form.formState.isSubmitting && (
							<MoonLoader size={20} color="#fff" />
						)}
					</Button>
				</div>
			</form>
		</Form>
	);

	return (
		<div className="lg:h-screen lg:h-svh lg:overflow-y-scroll w-full py-6 bg-white ">
			{formContent}
			<ConfirmationDialog
				description="Are you sure you want to reset your preferences to default?"
				open={resetToDefaultDialogOpen}
				onOpenChange={setResetToDefaultDialogOpen}
				onConfirm={onResetToDefaultConfirmed}
			/>
		</div>
	);
};

export default PreferencesPage;
