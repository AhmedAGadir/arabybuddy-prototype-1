import type { Metadata } from "next";
import {
	ClerkProvider,
	SignInButton,
	SignedIn,
	SignedOut,
	UserButton,
} from "@clerk/nextjs";

import "./globals.css";
import { inter, roboto } from "@/lib/fonts";

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
			<html lang="en" className="h-full bg-gray-100">
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
				<body className={(roboto.className, "h-full")}>{children}</body>
			</html>
		</ClerkProvider>
	);
}
