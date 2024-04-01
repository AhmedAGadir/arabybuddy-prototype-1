"use client";

import LanguageContext from "@/context/languageContext";
import React, { useContext } from "react";

const ChatPage = () => {
	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);
	return (
		<div>
			Chat {nativeLanguage} - {arabicDialect}
		</div>
	);
};

export default ChatPage;
