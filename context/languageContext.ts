import { ArabicDialect, NativeLanguage } from "@/types/types";
import React from "react";

export type LanguageSettings = {
	nativeLanguage: NativeLanguage | null;
	arabicDialect: ArabicDialect | null;
};

export type LanguageContextType = LanguageSettings & {
	setLanguages: (newLanguages: LanguageSettings) => void;
};

const LanguageContext = React.createContext<LanguageContextType>({
	nativeLanguage: null,
	arabicDialect: null,
	setLanguages: () => {},
});

export default LanguageContext;
