"use client";

import LanguageContext, { LanguageSettings } from "@/context/languageContext";
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/shared/Sidebar";
import Background from "@/components/shared/Background";

const Layout = ({ children }: { children: React.ReactNode }) => {
	const [languages, setLanguages] = useState<LanguageSettings>({
		nativeLanguage: null,
		arabicDialect: null,
	});

	const updateLanguages = (newLanguages: LanguageSettings) => {
		setLanguages(newLanguages);
	};

	return (
		<LanguageContext.Provider
			value={{ ...languages, setLanguages: updateLanguages }}
		>
			<main className="relative">
				<Background />
				{children}
				<Toaster />
			</main>
		</LanguageContext.Provider>
	);
};

export default Layout;
