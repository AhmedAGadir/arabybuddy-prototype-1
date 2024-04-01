"use client";

import LanguageContext from "@/context/languageContext";
import React, { useContext } from "react";

const ChatPage = () => {
	const { nativeLanguage, targetLanguage } = useContext(LanguageContext);
	return (
		<div>
			Chat {nativeLanguage} - {targetLanguage}
		</div>
	);
};

export default ChatPage;
