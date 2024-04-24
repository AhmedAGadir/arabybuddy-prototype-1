import { ArabicDialect } from "@/types/languagesTypes";
import React from "react";

export type DialectContextType = {
	arabicDialect: ArabicDialect | null;
	setArabicDialect: (newDialect: ArabicDialect) => void;
};

const DialectContext = React.createContext<DialectContextType>({
	arabicDialect: null,
	setArabicDialect: () => {},
});

export const DialectProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [arabicDialect, setArabicDialect] =
		React.useState<ArabicDialect | null>(null);

	const updateDialect = (newDialect: ArabicDialect) => {
		setArabicDialect(newDialect);
	};

	return (
		<DialectContext.Provider
			value={{ arabicDialect, setArabicDialect: updateDialect }}
		>
			{children}
		</DialectContext.Provider>
	);
};

export const useDialect = () => {
	const context = React.useContext(DialectContext);
	if (!context) {
		throw new Error("useDialect must be used within a DialectProvider");
	}
	return context;
};

export default DialectContext;
