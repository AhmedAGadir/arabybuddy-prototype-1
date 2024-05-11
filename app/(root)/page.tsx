"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
	SignedOut,
	SignInButton,
	SignedIn,
	SignUp,
	SignUpButton,
	SignOutButton,
	useUser,
	useClerk,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

import DialectContext, { useDialect } from "@/context/dialectContext";
import { ArabicDialect, ARABIC_DIALECTS } from "@/types/types";

import { useMediaQuery } from "@react-hooks-hub/use-media-query";

const formSchema = z.object({
	arabicDialect: z.string().min(2).max(50),
});

export default function Home() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			arabicDialect: "Modern Standard Arabic",
		},
	});

	const { setArabicDialect } = useDialect();

	const { openSignUp } = useClerk();
	const { isSignedIn } = useUser();

	const router = useRouter();

	if (isSignedIn) {
		router.push("/chat");
	}

	const formSubmitHandler = ({ arabicDialect }: z.infer<typeof formSchema>) => {
		setArabicDialect(arabicDialect as ArabicDialect);

		// try {
		// 	openSignUp();
		// 	router.push("/chat");
		// } catch (error) {
		// 	console.error("Error signing up", error);
		// }
	};

	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	const logoSize = isMobile ? 190 : 220;

	const authContent = (
		<>
			<SignedOut>
				<div className="flex flex-col md:flex-row w-full md:w-fit gap-4">
					<SignInButton>
						<Button size="lg">Log in</Button>
					</SignInButton>
					{/* <SignUpButton>
					<Button size="lg">Sign up</Button>
				</SignUpButton> */}
				</div>
			</SignedOut>
			{/* even though we will redirect away from here, we dont want to leave a chance of users getting stuck logged in */}
			<SignedIn>
				<div className="flex flex-col md:flex-row w-full md:w-fit">
					<SignOutButton>
						<Button size="lg">Log out</Button>
					</SignOutButton>
				</div>
			</SignedIn>
		</>
	);

	const formContent = (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(formSubmitHandler)}
				className="space-y-6 md:space-y-8"
			>
				<FormField
					control={form.control}
					name="arabicDialect"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Arabic Dialect</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								{...field}
							>
								<FormControl>
									<SelectTrigger className="w-full md:w-[250px] mx-auto">
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
				<SignUpButton>
					<Button
						// TODO: fix this
						// type="submit"
						size="lg"
						className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-8 h-11 text-center me-2 mb-2 w-full md:w-fit"
					>
						Try for free
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="w-4 h-4 ml-1"
						>
							<path
								fillRule="evenodd"
								d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
								clipRule="evenodd"
							/>
						</svg>
					</Button>
				</SignUpButton>
			</form>
		</Form>
	);

	return (
		<div className="bg-gradient bg-cover bg-center">
			<div className="md:container md:mx-auto min-h-screen min-h-svh relative flex flex-col justify-between ">
				<main className="flex-1 flex flex-col items-center max-w-5xl mx-auto px-4">
					<div className="hidden md:flex justify-end w-full py-3">
						{authContent}
					</div>
					<div className="flex-1 text-center flex flex-col items-center justify-center space-y-6 md:space-y-8 mt-8 md:mt-0">
						<Image
							src="/assets/arabybuddy.svg"
							alt="logo"
							width={logoSize}
							height={logoSize}
							className="mx-auto mb-2"
						/>
						<h1 className="text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
							Your AI Arabic Language Tutor
						</h1>
						<p className="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
							Try out our AI language buddy and learn a new Arabic dialect
							today! 🌎 ☕
						</p>
						<div className=" w-full md:w-fit">{formContent}</div>
						<div className="block md:hidden w-full pt-8">{authContent}</div>
					</div>
				</main>
				<footer aria-labelledby="footer-heading">
					<div className="mt-4 border-t border-white/10 pt-8 pb-4 md:mt-20 md:flex md:items-center md:justify-between lg:mt-24">
						<div className="flex space-x-6 md:order-2">
							<p className="mt-8 text-xs leading-5 text-gray-400 md:order-1 md:mt-0 px-4 md:px-0">
								&copy; 2024 Gadir Tech Ltd. All rights reserved.
							</p>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}
