import type { Metadata } from "next";

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
		<html lang="en">
			<head>
				<script src="https://cdn.jsdelivr.net/gh/c-kick/mobileConsole/hnl.mobileconsole.min.js"></script>
			</head>
			<body className={inter.className}>{children}</body>
		</html>
	);
}
