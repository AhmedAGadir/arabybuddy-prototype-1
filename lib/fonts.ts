import { Inter, Cairo } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const cairo = Cairo({
	subsets: ["arabic"],
	weight: ["400", "700"],
	variable: "--font-cairo",
});
