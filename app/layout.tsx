import type { Metadata } from "next";
import Image from "next/image";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
			<body className={inter.className}>
				<div className="bg-wrap">
					<Image
						alt="background"
						src={"/assets/background.png"}
						// placeholder="blur"
						quality={100}
						fill
						sizes="100vw"
						style={{
							objectFit: "cover",
						}}
					/>
				</div>
				{children}
			</body>
		</html>
	);
}
