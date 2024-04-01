"use client";

import React, { useState } from "react";
import LanguageContext, {
	type LanguageSettings,
} from "@/context/languageContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
	const [languages, setLanguages] = useState<LanguageSettings>({
		nativeLanguage: "",
		targetLanguage: "",
	});

	const updateLanguages = (newLanguages: LanguageSettings) => {
		setLanguages(newLanguages);
	};

	return (
		<LanguageContext.Provider
			value={{ ...languages, setLanguages: updateLanguages }}
		>
			{children}
		</LanguageContext.Provider>
	);
};

export default Layout;
