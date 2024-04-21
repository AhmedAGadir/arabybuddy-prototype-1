import type { Metadata } from "next";
import {
	ClerkProvider,
	SignInButton,
	SignedIn,
	SignedOut,
	UserButton,
} from "@clerk/nextjs";

import "./globals.css";
import { inter } from "@/lib/fonts";

export const metadata: Metadata = {
	title: "ArabyBuddy",
	description: "Your AI Arabic Language Tutor!",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider appearance={{ variables: { colorPrimary: "#38B6FF" } }}>
			<html lang="en">
				<head>
					{
						// MOBILE CONSOLE DEVTOOLS
						// when i eventually remove this, change eslinrc.json back to {"extends": "next/core-web-vitals"}
						// eslint-disable-next-line @next/next/no-sync-scripts
					}
					{
						// <script src="https://cdn.jsdelivr.net/gh/c-kick/mobileConsole/hnl.mobileconsole.min.js"></script>
					}
				</head>
				<body className={inter.className}>
					<header>
						<SignedOut>
							<SignInButton />
						</SignedOut>
						<SignedIn>
							<UserButton />
						</SignedIn>
					</header>
					{children}
				</body>
			</html>
		</ClerkProvider>
	);
}
