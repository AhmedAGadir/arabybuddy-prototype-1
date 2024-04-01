import React from "react";

export type LanguageSettings = {nativeLanguage: string, targetLanguage: string};

export type LanguageContextType = LanguageSettings & {
    setLanguages: (newLanguages: LanguageSettings) => void;
}

const LanguageContext = React.createContext<LanguageContextType>({
	nativeLanguage: "",
	targetLanguage: "",
	setLanguages: () => {},
});

export default LanguageContext;
