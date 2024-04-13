"use client";

import React, { useContext, useState, useMemo, useEffect, useRef } from "react";
import LanguageContext from "@/context/languageContext";
import { useLogger } from "@/hooks/useLogger";
import _ from "lodash";
import { useAudioService } from "@/hooks/useAudioService";
import { useChatService } from "@/hooks/useChatService";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Transition } from "@headlessui/react";

import { ChatMessage } from "@/types/messageTypes";
import MicrophoneBlob from "@/components/shared/MicrophoneBlob";
import { useRecording } from "@/hooks/useRecording/useRecording";

import { StopButton } from "@/components/shared/icons/Stop";
import ChatBubble from "@/components/shared/ChatBubble";
import { cn } from "@/lib/utils";
import { cairo } from "@/lib/fonts";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import {
	BookOpenIcon,
	BookOpenSolidIcon,
	MagicWandIcon,
	PlayIcon,
	TranslateIcon,
} from "@/components/shared/icons";

const instructions = {
	// idle: "Press ⬇️ the blue blob to start recording",
	idle: ["Click the blob to start recording"],
	recording: ["Click again to stop recording", "Say something in Arabic..."],
};

// try to keep business logic out of this page as its a presentation/view component
const ChatPage = () => {
	const logger = useLogger({ label: "ChatPage", color: "#fe7de9" });

	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);

	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

	const [activeTask, setActiveTask] = useState<
		"speech-to-text" | "assistant" | "text-to-speech" | null
	>(null);

	const activeTaskRef = useRef<
		"speech-to-text" | "assistant" | "text-to-speech" | null
	>(null);
	activeTaskRef.current = activeTask;

	const { addChatMessage, cancelAddChatMessageRequest } =
		useChatService(chatHistory);
	const {
		speechToText,
		textToSpeech,
		cancelSpeechToTextRequest,
		cancelTextToSpeechRequest,
	} = useAudioService();

	const { playAudio, isPlaying, initAudioElement, stopPlaying } =
		useAudioPlayer();

	const onRecordingComplete = async (audioBlob: Blob) => {
		// 1. transcribe the user audio
		setActiveTask("speech-to-text");
		const { transcription } = await speechToText(audioBlob);
		setChatHistoryWithTypewriterOnLatestMessage([
			...chatHistory,
			{ role: "user", content: transcription },
		]);

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

		await playAudio(base64Audio);
		return;
	};

	const { isRecording, startRecording, stopRecording, amplitude } =
		useRecording(onRecordingComplete, { autoRestartRecording: false });

	const isDoingTask = !_.isNull(activeTaskRef.current);

	const [showInstruction, setShowInstruction] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setShowInstruction(true);
		}, 1000);
	}, [isRecording]);

	const instruction = useMemo(() => {
		if (isRecording) {
			const randomIndex = Math.floor(
				Math.random() * instructions.recording.length
			);
			return instructions.recording[randomIndex];
		}
		if (!isRecording && !isPlaying && !isDoingTask) {
			const randomIndex = Math.floor(Math.random() * instructions.idle.length);
			return instructions.idle[randomIndex];
		}
		return "";
	}, [isDoingTask, isPlaying, isRecording]);

	const toggleRecording = () => {
		setShowInstruction(false);
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

	const microphoneMode = useMemo(() => {
		if (isRecording) return "recording";
		if (isPlaying) return "playing";
		if (!_.isNull(activeTaskRef.current)) return "processing";
		return "idle";
	}, [isPlaying, isRecording]);

	const stopEverything = () => {
		if (isPlaying) {
			stopPlaying();
		}
		if (activeTaskRef.current === "speech-to-text") {
			cancelSpeechToTextRequest();
		}
		if (activeTaskRef.current === "text-to-speech") {
			cancelTextToSpeechRequest();
		}
		if (activeTaskRef.current === "assistant") {
			cancelAddChatMessageRequest();
		}
		if (isRecording) {
			stopRecording({ force: true });
		}
	};

	const taskEmoji = useMemo(() => {
		if (activeTaskRef.current === "speech-to-text") return "🎤";
		if (activeTaskRef.current === "assistant") return "🤔";
		if (activeTaskRef.current === "text-to-speech") return "💬";
		return "";
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTask, activeTaskRef.current]);

	const isChatEmpty = _.isEmpty(chatHistory);
	const latestChatMessage = _.last(chatHistory);
	// ?? {
	// 	role: "assistant",
	// 	content: "السلام عليكم كيف حالك اليوم؟",
	// };

	const latesChatMessageIsAssistant = latestChatMessage?.role === "assistant";

	const [completedTyping, setCompletedTyping] = useState(false);

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

	const dropdownItems = useMemo(() => {
		return [
			{ label: "Replay", icon: PlayIcon, onClick: () => {} },
			{ label: "Translate", icon: TranslateIcon, onClick: () => {} },
			{ label: "Rephrase", icon: MagicWandIcon, onClick: () => {} },
			"separator" as "separator",
			{
				label: "Dictionary (Bilingual)",
				icon: BookOpenIcon,
				onClick: () => {},
			},
			{
				label: "Dictionary (Monolingual)",
				icon: BookOpenSolidIcon,
				onClick: () => {},
			},
		];
	}, []);

	return (
		<div
			className={cn(
				"w-full h-svh h-100dvh flex flex-col items-center justify-between max-w-4xl mx-auto px-5",
				cairo.className
			)}
		>
			<div className="h-full w-full flex justify-center items-center">
				{/* {true && ( */}
				{!isChatEmpty && (
					<ChatBubble
						name={latesChatMessageIsAssistant ? "ArabyBuddy" : "User"}
						avatarSrc={
							latesChatMessageIsAssistant
								? "/assets/arabybuddy.svg"
								: "/assets/user.svg"
						}
						rtl={true}
						reverse={true}
						glow={isPlaying}
						dropdownItems={dropdownItems}
						content={
							<span
								className={cn(
									// "font-bold",
									"text-2xl md:text-3xl lg:text-4xl text-transparent bg-clip-text leading-loose text-slate-900",
									isPlaying &&
										"bg-gradient-to-r to-araby-purple from-araby-purple"
								)}
							>
								{latestChatMessage?.content}
							</span>
						}
					/>
				)}
			</div>
			<div className="relative w-fit">
				<div className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-screen">
					{isDoingTask && (
						<div className="text-5xl text-center">{taskEmoji}</div>
					)}

					<Transition
						className={cn(
							"text-center px-5 font-extrabold text-3xl lg:text-4xl tracking-tight",
							"opacity-50 text-transparent bg-clip-text bg-gradient-to-r to-araby-purple from-araby-blue p-10 text-slate-900 "
						)}
						show={showInstruction}
						enter="transition-all ease-in-out duration-500 delay-[200ms]"
						enterFrom="opacity-0 translate-y-6"
						enterTo="opacity-100 translate-y-0"
						leave="transition-all ease-in-out duration-300"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						{instruction}
					</Transition>
				</div>
				<div className="text-center w-fit m-auto ">
					<MicrophoneBlob
						onClick={toggleRecording}
						mode={microphoneMode}
						amplitude={amplitude}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChatPage;

// {/* <p> */}
// 		{/* Chat {nativeLanguage} - {arabicDialect}
// 		</p> */}
// 		{/* <Link href="/">
// 			<div className="rounded-md p-2 bg-white w-fit ">
// 				<Image
// 					src="/assets/arabybuddy.svg"
// 					alt="logo"
// 					width={50}
// 					height={50}
// 				/>
// 			</div>
// 		</Link> */}
// 		{/* {
// 			<div className="w-2/3 md:w-1/2 m-auto">
// 				<BackgroundGradient
// 					className="rounded-[22px] p-4 bg-white"
// 					animate={false}
// 				>
// 					<div className="flex-1 flex w-full justify-between">
// 						<div className="space-y-1">
// 							<p className="text-sm font-medium leading-none">
// 								{isPlaying
// 									? "Playing"
// 									: isRecording
// 									? "Recording"
// 									: "Recorded"}
// 							</p>
// 							<p className="text-sm">{displayedMessage}</p>
// 						</div>

// 						{isRecording && (
// 							<div className="rounded-full w-4 h-4 bg-red-400 animate-pulse" />
// 						)}
// 					</div>
// 				</BackgroundGradient>
// 			</div>
// 		} */}
// 		{/* {result && (
// 			<div className="w-2/3 md:w-1/2 m-auto my-4">
// 				<BackgroundGradient
// 					className="rounded-[22px] p-4 bg-white"
// 					animate={false}
// 				>
// 					{result}
// 				</BackgroundGradient>
// 			</div>
// 		)} */}
