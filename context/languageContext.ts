import { ArabicDialect } from "@/types/languagesTypes";
import React from "react";

export type LanguageContextType = {
	arabicDialect: ArabicDialect | null;
	setDialect: (newDialect: ArabicDialect) => void;
};

const LanguageContext = React.createContext<LanguageContextType>({
	arabicDialect: null,
	setDialect: () => {},
});

export default LanguageContext;
