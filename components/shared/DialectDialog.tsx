import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ChatPartner } from "@/lib/chatPartners";
import ChatPartnerAvatar from "./ChatPartnerAvatar";
import { ArabicDialect } from "@/types/types";
import MoonLoader from "react-spinners/MoonLoader";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

const DialectDialog = ({
	open,
	onOpenChange,
	chatPartner,
	onDialectSelected,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	chatPartner: ChatPartner;
	onDialectSelected: (dialect: ArabicDialect) => void;
}) => {
	const closeDialog = () => {
		onOpenChange(false);
	};

	const dialectsFormSchema = z.object({
		arabic_dialect: z.enum(
			chatPartner.dialects as unknown as [string, ...string[]]
		),
	});

	const { toast } = useToast();

	const form = useForm<z.infer<typeof dialectsFormSchema>>({
		resolver: zodResolver(dialectsFormSchema),
		defaultValues: {
			arabic_dialect: chatPartner.dialects[0],
		},
	});

	const formSubmitHandler = async (
		values: z.infer<typeof dialectsFormSchema>
	) => {
		try {
			await onDialectSelected(values.arabic_dialect as ArabicDialect);
			// toast({
			// 	title: "Conversation started!",
			// 	description: `You are now conversing with ${chatPartner.name} in the ${values.arabic_dialect} dialect.`,
			// 	className: "success-toast",
			// 	duration: 5000,
			// });
		} catch (error) {
			toast({
				title: "Error saving preferences",
				description:
					"An error occurred while selecting a dialect. Please try again.",
				className: "error-toast",
				duration: 5000,
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Choose a dialect</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-5 justify-center items-center">
					<div className="w-auto">
						<ChatPartnerAvatar
							chatPartner={chatPartner}
							classes={{
								image: `w-32 h-32 ${
									chatPartner.id !== "arabybuddy" &&
									"ring-2 ring-slate-300 ring-offset-4 ring-offset-slate-50"
								}`,
								flag: "text-2xl",
							}}
						/>
					</div>
					<DialogDescription>
						<p className="text-center">
							<span className="font-semibold">{chatPartner.name}</span> speaks a
							few different dialects. Choose one to start a conversation.
						</p>
					</DialogDescription>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(formSubmitHandler)}
							className="relative w-full"
						>
							<FormField
								control={form.control}
								name="arabic_dialect"
								render={({ field }) => (
									<FormItem className="space-y-4 max-h-[250px] overflow-y-scroll p-2">
										<RadioGroup
											value={field.value}
											onChange={field.onChange}
											defaultValue={field.value}
										>
											{/* <RadioGroup.Label className="block text-sm font-medium leading-6 text-gray-900">
													Arabic Dialect
												</RadioGroup.Label> */}

											<div className="flex flex-col gap-2">
												{chatPartner.dialects.map((dialect) => (
													<RadioGroup.Option
														key={dialect}
														value={dialect}
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
																			{dialect}
																		</RadioGroup.Label>
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

							<DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
								<Button
									type="button"
									size="lg"
									variant="outline"
									className="mx-auto w-full"
									onClick={closeDialog}
									disabled={form.formState.isSubmitting}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									size="lg"
									variant="indigo"
									className="mx-auto w-full"
									disabled={form.formState.isSubmitting || !chatPartner}
								>
									{!form.formState.isSubmitting && (
										<span>Start Conversation</span>
									)}
									{form.formState.isSubmitting && (
										<MoonLoader size={20} color="#fff" />
									)}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DialectDialog;
