"use client";

import { useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import LanguageContext, { LanguageSettings } from "@/context/languageContext";
import TryForFreeForm from "@/components/shared/TryForFreeForm";
import {
	SignedOut,
	SignInButton,
	SignedIn,
	UserButton,
	SignUp,
	SignUpButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@react-hooks-hub/use-media-query";

export default function Home() {
	const { setLanguages } = useContext(LanguageContext);

	const router = useRouter();

	function onSubmit(values: LanguageSettings) {
		setLanguages(values);
		router.push("/chat");
	}

	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	const logoSize = isMobile ? 170 : 220;

	return (
		<>
			<div className="md:container md:mx-auto min-h-svh relative flex flex-col justify-between ">
				<main className="flex-1 flex flex-col items-center max-w-5xl mx-auto px-4 ">
					<div className="py-3 flex justify-end w-full">
						<SignedOut>
							<div className="flex flex-col md:flex-row w-full md:w-fit gap-4">
								<SignInButton>
									<Button size="lg" variant="outline">
										Log in
									</Button>
								</SignInButton>
								<SignUpButton>
									<Button size="lg">Sign up</Button>
								</SignUpButton>
							</div>
						</SignedOut>
					</div>
					<div className="pt-0 md:mt-6 flex-1 text-center  flex flex-col items-center justify-center">
						<Image
							src="/assets/arabybuddy.svg"
							alt="logo"
							width={logoSize}
							height={logoSize}
							className="mx-auto mb-2"
						/>
						<h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
							Your AI Arabic Language Tutor
						</h1>
						<p className="mb-6 text-md md:text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
							Try out our AI language buddy and learn a new Arabic dialect
							today! 🌎 ☕
						</p>
						<TryForFreeForm onSubmit={onSubmit} />
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
		</>
	);
}
