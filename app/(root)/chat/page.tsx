"use client";

import React, {
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
} from "react";
import LanguageContext from "@/context/languageContext";
import { BlobSvg } from "@/components/shared";
import { useRecording } from "@/hooks/useRecording/useRecording";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import {
	base64ToBlob,
	blobToBase64,
	cn,
	getAllSupportedMimeTypes,
} from "@/lib/utils";
import { useLogger } from "@/hooks/useLogger";
import CursorSVG from "@/components/shared/CursorSVG";
import _ from "lodash";
import { amiri } from "@/lib/fonts";
import { useAudioService } from "@/hooks/useAudioService";
import { useChatService } from "@/hooks/useChatService";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const ChatPage = () => {
	const logger = useLogger({ label: "ChatPage", color: "#fe7de9" });

	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);

	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

	const [activeTask, setActiveTask] = useState<
		"speech-to-text" | "assistant" | "text-to-speech" | null
	>(null);

	const { addChatMessage } = useChatService(chatHistory);

	const { speechToText, textToSpeech, playAudio, isPlaying, initAudioElement } =
		useAudioService();

	const onRecordingComplete = async (audioBlob: Blob) => {
		// 1. transcribe the user audio
		setActiveTask("speech-to-text");
		const { transcription } = await speechToText(audioBlob);

		// 2. add the user message to the chat
		setActiveTask("assistant");
		const { chatHistory: updatedChatHistory } = await addChatMessage({
			role: "user",
			content: transcription,
		});

		// 3. convert the assistants response to audio
		setActiveTask("text-to-speech");
		const { base64Audio } = await textToSpeech(
			(_.last(updatedChatHistory) as ChatMessage).content
		);

		// 4. play assistants response and update chat history
		setActiveTask(null);
		setChatHistoryWithTypewriterOnLatestMessage(updatedChatHistory);
		playAudio(base64Audio);
	};

	const { isRecording, startRecording, stopRecording, amplitude } =
		useRecording(onRecordingComplete, { autoRestartRecording: true });

	const toggleRecording = () => {
		if (isRecording) {
			stopRecording();
			return;
		}

		if (!isRecording) {
			initAudioElement();
			startRecording();
			return;
		}
	};

	const isLoading = activeTask !== null;

	const microphoneFillColor = useMemo(() => {
		if (isPlaying)
			return {
				fill: "#5E17EB",
			};
		if (isLoading)
			return {
				fill: "#64748b",
				fillOpacity: 0.1,
			};
		if (isRecording)
			return {
				fill: "#FF0066",
			};
		return {
			fill: "#38B6FF",
		};
	}, [isLoading, isPlaying, isRecording]);

	const [completedTyping, setCompletedTyping] = useState(false);

	// just a fancy way to type out the latest message
	const setChatHistoryWithTypewriterOnLatestMessage = (
		chatHistory: ChatMessage[]
	) => {
		const previousChatHistory = chatHistory.slice(0, chatHistory.length - 1);
		const latestChatMessage = _.last(chatHistory) as ChatMessage;

		setCompletedTyping(false);

		let i = 0;

		const intervalId = setInterval(() => {
			setChatHistory([
				...previousChatHistory,
				{
					...latestChatMessage,
					content: latestChatMessage.content.slice(0, i),
				},
			]);

			i++;

			if (i > latestChatMessage.content.length) {
				clearInterval(intervalId);
				setCompletedTyping(true);
			}
		}, 50);

		return () => clearInterval(intervalId);
	};

	const displayedMessage = useMemo(() => {
		if (isRecording && _.isEmpty(chatHistory)) return "👂";
		if (activeTask === "speech-to-text") return "💬";
		if (activeTask === "assistant") return "🤔";
		if (activeTask === "text-to-speech") return "📬";
		if (isPlaying || !_.isEmpty(chatHistory)) {
			return _.last(chatHistory)?.content ?? "";
		}
		return "Press ⬇️ the blue blob to start recording";
	}, [activeTask, isPlaying, isRecording, chatHistory]);

	return (
		<div className="w-full h-svh h-100dvh flex flex-col items-center justify-between">
			{/* <p> */}
			{/* Chat {nativeLanguage} - {arabicDialect}
			</p> */}
			{/* <Link href="/">
				<div className="rounded-md p-2 bg-white w-fit ">
					<Image
						src="/assets/arabybuddy.svg"
						alt="logo"
						width={50}
						height={50}
					/>
				</div>
			</Link> */}
			{/* {
				<div className="w-2/3 md:w-1/2 m-auto">
					<BackgroundGradient
						className="rounded-[22px] p-4 bg-white"
						animate={false}
					>
						<div className="flex-1 flex w-full justify-between">
							<div className="space-y-1">
								<p className="text-sm font-medium leading-none">
									{isPlaying
										? "Playing"
										: isRecording
										? "Recording"
										: "Recorded"}
								</p>
								<p className="text-sm">{displayedMessage}</p>
							</div>

							{isRecording && (
								<div className="rounded-full w-4 h-4 bg-red-400 animate-pulse" />
							)}
						</div>
					</BackgroundGradient>
				</div>
			} */}
			{/* {result && (
				<div className="w-2/3 md:w-1/2 m-auto my-4">
					<BackgroundGradient
						className="rounded-[22px] p-4 bg-white"
						animate={false}
					>
						{result}
					</BackgroundGradient>
				</div>
			)} */}
			<div className="max-w-4xl m-auto relative">
				<p
					className={cn(
						"font-extrabold tracking-tight text-4xl md:text-5xl lg:text-6xl text-center px-5 text-slate-900",
						!_.isEmpty(chatHistory) &&
							`${amiri.className} font-light leading-relaxed md:leading-relaxed lg:leading-relaxed`, // when displaying arabic text
						isPlaying && "text-araby-purple", // while playing
						(!_.isNil(activeTask) || isRecording) && "text-5xl" // for emojis
					)}
					// for the cursor to be on the left side of the text
					{...(isPlaying ? { style: { direction: "rtl" } } : {})}
				>
					{displayedMessage} {isPlaying && !completedTyping && <CursorSVG />}
				</p>
				<p className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-max h-[20px] text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 text-center dark:text-gray-400"></p>
			</div>
			<div className="flex items-center w-full">
				<button
					className={cn("mt-10 m-auto", !isLoading && "cursor-pointer")}
					onClick={toggleRecording}
					disabled={isLoading || isPlaying}
				>
					<BlobSvg
						size={amplitude ? 200 + amplitude * 2 : 200}
						{...microphoneFillColor}
					/>
				</button>
			</div>
		</div>
	);
};

export default ChatPage;
