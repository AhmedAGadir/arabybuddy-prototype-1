"use client";

import LanguageContext, { LanguageSettings } from "@/context/languageContext";
import React, { useState } from "react";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/shared/Sidebar";

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
			<main className="bg-wrap">
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
				{children}
				<Toaster />
			</main>
		</LanguageContext.Provider>
	);
};

export default Layout;
