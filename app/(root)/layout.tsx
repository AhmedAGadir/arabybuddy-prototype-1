"use client";

import React, { useState } from "react";
import Image from "next/image";
import LanguageContext, {
	type LanguageSettings,
} from "@/context/languageContext";
import VConsole from "vconsole";

const Layout = ({ children }: { children: React.ReactNode }) => {
	const [languages, setLanguages] = useState<LanguageSettings>({
		nativeLanguage: null,
		arabicDialect: null,
	});

	const updateLanguages = (newLanguages: LanguageSettings) => {
		setLanguages(newLanguages);
	};

	React.useEffect(() => {
		// for debugging on mobile
		const vConsole = new VConsole({ theme: "dark" });
	}, []);

	return (
		<LanguageContext.Provider
			value={{ ...languages, setLanguages: updateLanguages }}
		>
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
		</LanguageContext.Provider>
	);
};

export default Layout;
