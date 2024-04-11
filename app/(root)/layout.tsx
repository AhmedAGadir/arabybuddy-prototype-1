"use client";

import React, { useState } from "react";
import Image from "next/image";
import LanguageContext, {
	type LanguageSettings,
} from "@/context/languageContext";
import eruda from "eruda";

// for eruda debugging on mobile
declare global {
	interface self {}
}

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
		eruda.init();
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
