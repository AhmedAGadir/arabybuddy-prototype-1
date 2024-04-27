import { Inter, Cairo, Roboto } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const roboto = Roboto({
	subsets: ["latin"],
	weight: ["100", "300", "400", "500", "700", "900"],
	variable: "--font-roboto",
});

export const cairo = Cairo({
	subsets: ["arabic"],
	weight: ["400", "500", "600", "700", "800", "900"],
	variable: "--font-cairo",
});
