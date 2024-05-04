"use client";

import { useLogger } from "@/hooks/useLogger";
import { usePreferences } from "@/hooks/usePreferences";
import {
	createPreferences,
	getPreferencesById,
} from "@/lib/actions/preferences.actions";
import {
	DEFAULT_USER_PREFERENCES,
	IPreferences,
} from "@/lib/database/models/preferences.model";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import SkewLoader from "react-spinners/SkewLoader";
import MoonLoader from "react-spinners/MoonLoader";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";

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
	voice_stability: z.number().refine((value) => value >= 0.3, {
		message: "Values under 30% may lead to instability",
	}),
	voice_similarity_boost: z.number(),
	voice_style: z.number().refine((value) => value <= 0.5, {
		message: "Values over 50% may lead to instability",
	}),
	voice_use_speaker_boost: z.boolean(),
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
		createPreferences,
		updatePreferences,
	} = usePreferences();

	// TODO: useToast, handle errors, loading states, saving state etc.

	const { user } = useUser();

	const { toast, dismiss } = useToast();

	const form = useForm<z.infer<typeof preferencesFormSchema>>({
		resolver: zodResolver(preferencesFormSchema),
	});

	useEffect(() => {
		if (!isPending && !error && preferences) {
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
		}
	}, [isPending, error, preferences, form]);

	// // Watch all inputs in the form
	// const formState = form.watch();

	// useEffect(() => {
	// 	// Log the form state whenever it changes
	// 	console.log("Form state:", formState);
	// 	console.log("Form errors:", form.formState.errors);
	// 	console.log("stability", form.getFieldState("voice_stability"));
	// }, [formState]);

	const formSubmitHandler = async (
		values: z.infer<typeof preferencesFormSchema>
	) => {
		try {
			logger.log("submitting form", JSON.stringify(values));

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
			console.log("resetting to default", {
				...preferences,
				...DEFAULT_USER_PREFERENCES,
			});
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

	// useEffect(() => {
	// 	if (!error && !isPending && !preferences && user?.id) {
	// 		createPreferences({
	// 			clerkId: user.id,
	// 			...DEFAULT_USER_PREFERENCES,
	// 		});
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [preferences, user, error, isPending]);

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
	}, [form.formState, preferences]);

	console.log(
		"formStateEqualToDefaultPreferences",
		formStateEqualToDefaultPreferences
	);

	if (isPending) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-svh ">
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

	if (error) return <div>Error loading preferences: {error.message}</div>;

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
					<div className="grid grid-cols-1 px-6 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">
								Dialect & Proficiency
							</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">
								Select your preferred Arabic dialect and define your proficiency
								level for tailored communication with your assistant.
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
						</div>
					</div>

					<div className="grid grid-cols-1 px-6 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">
								Interaction Style
							</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">
								Customize how your assistant interacts with you by setting your
								assistant profile, response style, and detail level.
							</p>
						</div>

						<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
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
							</div>  */}

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
							</div>  */}

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
						</div>
					</div>

					<div className="grid grid-cols-1 px-6 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">
								Voice Customization
							</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">
								Fine-tune the technical aspects of your assistant&apos;s voice
								to suit your auditory preferences.
							</p>
						</div>

						<div className="max-w-2xl space-y-10 md:col-span-2">
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
						</div>
					</div>
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
						className="w-full md:w-fit rounded-md bg-indigo-600  text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
		<div className="lg:h-svh lg:overflow-y-scroll w-full py-6 bg-white ">
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
