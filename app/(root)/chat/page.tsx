"use client";

import React, { useContext } from "react";
import LanguageContext from "@/context/languageContext";
import VoiceRecorder from "@/components/shared/VoiceRecorder";

const ChatPage = () => {
	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);
	return (
		<div>
			Chat {nativeLanguage} - {arabicDialect}
			<div>
				<VoiceRecorder />
			</div>
		</div>
	);
};

export default ChatPage;
