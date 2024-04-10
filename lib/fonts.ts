import { Inter, Amiri } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const amiri = Amiri({
	subsets: ["arabic"],
	weight: ["400", "700"],
	variable: "--font-amiri",
});
