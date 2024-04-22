"use client";

import LanguageContext from "@/context/languageContext";
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/shared/Sidebar";
import Background from "@/components/shared/Background";
import { ArabicDialect } from "@/types/languagesTypes";

const Layout = ({ children }: { children: React.ReactNode }) => {
	const [arabicDialect, setArabicDialect] = useState<ArabicDialect | null>(
		null
	);

	const updateDialect = (newDialect: ArabicDialect) => {
		setArabicDialect(newDialect);
	};

	return (
		<LanguageContext.Provider
			value={{ arabicDialect, setDialect: updateDialect }}
		>
			{/* for background image to use "fill" prop, parent needs position relative */}
			<main className="relative">
				<Background />
				{children}
				<Toaster />
			</main>
		</LanguageContext.Provider>
	);
};

export default Layout;
