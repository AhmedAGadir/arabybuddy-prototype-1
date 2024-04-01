"use client";

import { useContext } from "react";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LANGUAGES } from "@/types/types";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
import LanguageContext from "@/context/languageContext";

const formSchema = z.object({
	nativeLanguage: z.string().min(2).max(50),
	targetLanguage: z.string().min(2).max(50),
});

export default function Home() {
	const { setLanguages } = useContext(LanguageContext);

	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			nativeLanguage: "English",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		setLanguages(values);

		router.push("/chat");
	}

	return (
		<div className="md:container md:mx-auto text-center h-screen relative flex flex-col justify-between">
			<main className="flex-1 flex flex-col justify-center items-center px-4">
				<div className="max-w-5xl pt-6">
					<Image
						src="/assets/languagebuddy.png"
						alt="logo"
						width={250}
						height={250}
						className="mx-auto"
					/>
					<h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
						Conversate with our AI tutor in your target language
					</h1>
					<p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
						Try out our AI language buddy to practice outputting your target
						language today! 🌎 ☕
					</p>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="nativeLanguage"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Native Language</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											{...field}
										>
											<FormControl>
												<SelectTrigger className="w-[200px] mx-auto">
													<SelectValue placeholder="Select Language" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{LANGUAGES.map((language) => (
													<SelectItem value={language} key={language}>
														{language}
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="targetLanguage"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Target Language</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											{...field}
										>
											<FormControl>
												<SelectTrigger className="w-[200px] mx-auto">
													<SelectValue placeholder="Select Language" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{LANGUAGES.map((language) => (
													<SelectItem value={language} key={language}>
														{language}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit">Submit</Button>
						</form>
					</Form>
				</div>
			</main>
			<footer aria-labelledby="footer-heading">
				<div className="mt-16 border-t border-white/10 pt-8 pb-4 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-24">
					<div className="flex space-x-6 md:order-2">
						<p className="mt-8 text-xs leading-5 text-gray-400 md:order-1 md:mt-0 px-4 md:px-0">
							&copy; 2024 Gadir Tech Ltd. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
