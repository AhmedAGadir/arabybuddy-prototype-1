"use client";

import React, {
	useContext,
	useState,
	useMemo,
	useEffect,
	useRef,
	useCallback,
} from "react";
import LanguageContext from "@/context/languageContext";
import { useLogger } from "@/hooks/useLogger";
import _, { set } from "lodash";
import { useAudioService } from "@/hooks/useAudioService";
import { useChatService } from "@/hooks/useChatService";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Transition } from "@headlessui/react";

import { ChatMessage } from "@/types/messageTypes";
import MicrophoneBlob from "@/components/shared/MicrophoneBlob";
import { useRecording } from "@/hooks/useRecording";

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
	PreferencesIcon,
	TranslateIcon,
} from "@/components/shared/icons";
import { useMediaQuery } from "@react-hooks-hub/use-media-query";

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationNextVertical,
	PaginationPrevious,
	PaginationPreviousVertical,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import PulseLoader from "react-spinners/PulseLoader";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useToast } from "@/components/ui/use-toast";

const statusEnum = {
	IDLE: "IDLE",
	RECORDING: "RECORDING",
	PLAYING: "PLAYING",
	PROCESSING: "PROCESSING",
} as const;

export type Status = (typeof statusEnum)[keyof typeof statusEnum];

const instructions: {
	[key in Status]: string[];
} = {
	// idle: "Press ⬇️ the blue blob to start recording",
	IDLE: ["Click the blob to start recording"],
	RECORDING: ["Click again to stop recording", "Say something in Arabic..."],
	PLAYING: [""],
	PROCESSING: [""],
};

const taskEnum = {
	SPEECH_TO_TEXT: "SPEECH_TO_TEXT",
	ASSISTANT: "ASSISTANT",
	TEXT_TO_SPEECH: "TEXT_TO_SPEECH",
} as const;

export type Task = (typeof taskEnum)[keyof typeof taskEnum];

// try to keep business logic out of this page as its a presentation/view component
const ChatPage = () => {
	const logger = useLogger({ label: "ChatPage", color: "#fe7de9" });

	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);

	const { toast, dismiss } = useToast();

	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
	const [chatHistoryBackup, setChatHistoryBackup] = useState<ChatMessage[]>([]);

	const [displayedChatMessageInd, setDisplayedChatMessageInd] =
		useState<number>(0);

	const [activeTask, setActiveTask] = useState<Task | null>(null);
	// only to be used in onRecordingComplete since it has a closure over the activeTask state
	const activeTaskRef = useRef<Task | null>(null);
	activeTaskRef.current = activeTask;

	const [progressBarValue, setProgressBarValue] = useState(0);
	const progressBarValueRef = useRef<number>();
	progressBarValueRef.current = progressBarValue;

	const { addChatMessage, abortAddChatMessageRequest } =
		useChatService(chatHistory);
	const {
		speechToText,
		textToSpeech,
		abortSpeechToTextRequest,
		abortTextToSpeechRequest,
	} = useAudioService();

	const { playAudio, isPlaying, initAudioElement, stopPlaying } =
		useAudioPlayer();

	const onRecordingComplete = useCallback(
		async (audioBlob: Blob) => {
			try {
				// 1. transcribe the user audio
				setActiveTask(taskEnum.SPEECH_TO_TEXT);
				const { transcription } = await speechToText(audioBlob);
				setProgressBarValue(25);
				await setChatHistoryWithTypewriterOnLatestMessage([
					...chatHistory,
					{ role: "user", content: transcription },
				]);

				// add the loading message and update the displayed message index
				// right now were using a hack so that we dont have to remove the loading message
				// i think its because when we call addChatMessage, there is a closure over the chatHistory
				// TODO: fix this hack
				let chatHistoryLength = chatHistory.length;
				setChatHistory((prevChatHistory) => {
					const updatedChatHistory: ChatMessage[] = [
						...prevChatHistory,
						{ role: "assistant", content: "loading" },
					];
					chatHistoryLength = updatedChatHistory.length;
					return updatedChatHistory;
				});
				setDisplayedChatMessageInd(chatHistoryLength - 1);

				// 2. add the user message to the chat
				setActiveTask(taskEnum.ASSISTANT);
				const { chatHistory: updatedChatHistory } = await addChatMessage({
					role: "user",
					content: transcription,
				});

				// 3. convert the assistants response to audio
				setProgressBarValue(75);
				setActiveTask(taskEnum.TEXT_TO_SPEECH);
				const { base64Audio } = await textToSpeech(
					(_.last(updatedChatHistory) as ChatMessage).content
				);

				// 4. play assistants response and update chat history
				setProgressBarValue(100);
				setActiveTask(null);
				// remove loading message
				// setChatHistory((prevChatHistory) => prevChatHistory.slice(0, -1));
				setChatHistoryWithTypewriterOnLatestMessage(updatedChatHistory);
				await playAudio(base64Audio);
				setProgressBarValue(0);
				setChatHistoryBackup([]);
			} catch (error) {
				if ((error as any).name === "AbortError") {
					toast({
						title: "Message cancelled",
						description: "The request was aborted.",
					});
				} else {
					logger.error("onRecordingComplete failed", error);
					toast({
						title: "Uh oh! Something went wrong.",
						description: "There was a problem with your request.",
						variant: "destructive",
					});
				}
				setChatHistory(chatHistoryBackup);
				if (isPlaying) {
					stopPlaying();
				}

				setActiveTask(null);
				setProgressBarValue(0);

				setTimeout(() => {
					dismiss();
					setChatHistoryBackup([]);
				}, 10000);

				// propagate the error so that the recording can be stopped
				throw error;
			}
		},
		[
			addChatMessage,
			chatHistory,
			chatHistoryBackup,
			dismiss,
			isPlaying,
			logger,
			playAudio,
			speechToText,
			stopPlaying,
			textToSpeech,
			toast,
		]
	);

	const { isRecording, startRecording, stopRecording, amplitude } =
		useRecording(onRecordingComplete, { autoRestartRecording: false });

	const [showInstruction, setShowInstruction] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setShowInstruction(true);
		}, 1000);
	}, [isRecording]);

	const STATUS: Status = useMemo(() => {
		if (isRecording) return statusEnum.RECORDING;
		if (isPlaying) return statusEnum.PLAYING;
		if (activeTask !== null) return statusEnum.PROCESSING;
		return statusEnum.IDLE;
	}, [activeTask, isPlaying, isRecording]);

	const isDoingSpeechToText = activeTask === taskEnum.SPEECH_TO_TEXT;
	const isDoingAssistant = activeTask === taskEnum.ASSISTANT;
	const isDoingTextToSpeech = activeTask === taskEnum.TEXT_TO_SPEECH;

	const instruction = useMemo(() => {
		const statusInstructions = instructions[STATUS];
		const randomIndex = Math.floor(Math.random() * statusInstructions.length);
		return statusInstructions[randomIndex];
	}, [STATUS]);

	const toggleRecording = () => {
		setShowInstruction(false);
		if (isRecording) {
			stopRecording();
			return;
		}

		if (!isRecording) {
			initAudioElement();
			setChatHistoryBackup(chatHistory);
			startRecording();
			return;
		}
	};

	const abortProcessingBtnHandler = useCallback(() => {
		if (STATUS !== statusEnum.PROCESSING) return;
		switch (activeTask) {
			case taskEnum.SPEECH_TO_TEXT:
				abortSpeechToTextRequest();
				break;
			case taskEnum.TEXT_TO_SPEECH:
				abortTextToSpeechRequest();
				break;
			case taskEnum.ASSISTANT:
				abortAddChatMessageRequest();
				break;
			default:
				break;
		}
	}, [
		STATUS,
		abortAddChatMessageRequest,
		abortSpeechToTextRequest,
		abortTextToSpeechRequest,
		activeTask,
	]);

	const [completedTyping, setCompletedTyping] = useState(false);
	const [skipTyping, setSkipTyping] = useState(false);
	const skipTypingRef = useRef(false);
	skipTypingRef.current = skipTyping;

	const stopPlayingBtnHandler = useCallback(() => {
		stopPlaying();
		setSkipTyping(true);
	}, [stopPlaying]);

	const setChatHistoryWithTypewriterOnLatestMessage = async (
		chatHistory: ChatMessage[]
	) => {
		const previousChatHistory = chatHistory.slice(0, -1);
		const latestChatMessage = _.last(chatHistory) as ChatMessage;

		setCompletedTyping(false);

		let i = 0;

		const promise = new Promise<void>((resolve) => {
			const intervalId = setInterval(() => {
				if (skipTypingRef.current) {
					setChatHistory([
						...previousChatHistory,
						{
							...latestChatMessage,
							content: latestChatMessage.content,
						},
					]);
					setCompletedTyping(true);
					clearInterval(intervalId);
					setSkipTyping(false);
					resolve();
					return;
				}

				setChatHistory([
					...previousChatHistory,
					{
						...latestChatMessage,
						content: latestChatMessage.content.slice(0, i),
					},
				]);
				setDisplayedChatMessageInd(chatHistory.length - 1);

				i++;

				if (i > latestChatMessage.content.length) {
					clearInterval(intervalId);
					setCompletedTyping(true);

					setTimeout(() => {
						// wait a bit before resolving
						resolve();
					}, 750);
				}
			}, 40);
		});

		return promise;
		// return () => clearInterval(intervalId);
	};

	const chatMenuItems = useMemo(() => {
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

	const isChatEmpty = _.isEmpty(chatHistory);
	const displayedChatMessage = chatHistory[displayedChatMessageInd];

	const paginationPrevDisabled = isPlaying || displayedChatMessageInd === 0;
	const paginationNextDisabled =
		isPlaying || displayedChatMessageInd === chatHistory.length - 1;

	const paginationContent = (
		<Pagination className="mt-3">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						onClick={() =>
							setDisplayedChatMessageInd(displayedChatMessageInd - 1)
						}
						className={cn(
							paginationPrevDisabled &&
								"pointer-events-none opacity-25 hover:bg-transparent"
						)}
					/>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext
						onClick={() =>
							setDisplayedChatMessageInd(displayedChatMessageInd + 1)
						}
						className={cn(
							paginationNextDisabled &&
								"pointer-events-none opacity-25 hover:bg-transparent"
						)}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);

	const instructionContent = (
		<Transition
			className={cn(
				"text-center px-5 font-extrabold text-2xl md:text-3xl tracking-tight",
				"opacity-50 text-transparent bg-clip-text bg-gradient-to-r to-araby-purple from-araby-blue p-10 text-slate-700 "
			)}
			show={showInstruction}
			enter="transition-all ease-in-out duration-500 delay-200"
			enterFrom="opacity-0 translate-y-6"
			enterTo="opacity-100 translate-y-0"
			leave="transition-all ease-in-out duration-300"
			leaveFrom="opacity-100"
			leaveTo="opacity-0"
		>
			{instruction}
		</Transition>
	);

	const progressBarContent = (
		<Progress
			className="rounded-none h-1 md:h-2"
			innerClassName="bg-gradient-to-r to-araby-purple from-araby-purple"
			value={progressBarValueRef.current}
		/>
	);

	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	return (
		<div
			className={cn(
				"w-full h-svh h-100dvh flex flex-col items-center justify-between max-w-3xl mx-auto px-5",
				cairo.className
			)}
		>
			<div className="w-screen absolute top-0 left-0">{progressBarContent}</div>
			<div className="h-full w-full flex flex-col justify-center items-center">
				<div className={cn("flex flex-col w-full")}>
					<div className="w-full md:w-auto max-w-3xl m-auto">
						{!isChatEmpty && (
							<ChatBubble
								name={
									displayedChatMessage?.role === "assistant"
										? "ArabyBuddy"
										: "You"
								}
								avatarSrc={
									displayedChatMessage?.role === "assistant"
										? "/assets/arabybuddy.svg"
										: "/assets/user.svg"
								}
								avatarAlt={
									displayedChatMessage?.role === "assistant"
										? "ArabyBuddy avatar"
										: "User avatar"
								}
								glow={isPlaying}
								chatMenuItems={chatMenuItems}
								chatMenuDisabled={STATUS !== statusEnum.IDLE}
								reverse
								rtl
								content={
									<span
										className={cn(
											// "font-bold",
											"text-xl md:text-3xl  text-transparent bg-clip-text leading-loose text-slate-900",
											isPlaying &&
												"bg-gradient-to-r to-araby-purple from-araby-purple"
										)}
									>
										{displayedChatMessage?.role === "assistant" &&
											displayedChatMessage?.content === "loading" && (
												<PulseLoader
													color="#5E17EB"
													loading
													cssOverride={{
														display: "block",
														margin: "0",
														width: 250,
													}}
													size={isMobile ? 6 : 8}
													aria-label="Loading Spinner"
													data-testid="loader"
												/>
											)}
										{displayedChatMessage?.content !== "loading" &&
											displayedChatMessage?.content}
									</span>
								}
							/>
						)}
					</div>
					{!isChatEmpty && paginationContent}
				</div>
			</div>
			<div className="relative w-fit">
				<div
					className={cn(
						"absolute -top-[70px] md:-top-[60px] left-1/2 -translate-x-1/2 w-screen text-center"
					)}
				>
					{STATUS === statusEnum.PROCESSING && (
						<Button
							onClick={abortProcessingBtnHandler}
							variant="outline"
							size="lg"
						>
							Cancel
						</Button>
					)}
					{STATUS === statusEnum.PLAYING && (
						<Button onClick={stopPlayingBtnHandler} variant="default" size="lg">
							Stop Playing
						</Button>
					)}
					{instructionContent}
				</div>
				<div className="text-center w-fit m-auto ">
					<MicrophoneBlob
						onClick={toggleRecording}
						mode={STATUS}
						disabled={
							STATUS === statusEnum.PROCESSING || STATUS === statusEnum.PLAYING
						}
						amplitude={amplitude}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChatPage;

// const taskEmoji = useMemo(() => {
// 	if (isDoingSpeechToText) return "🎤";
// 	if (isDoingAssistant) return "🤔";
// 	if (isDoingTextToSpeech) return "💬";
// 	return "";
// }, [isDoingAssistant, isDoingSpeechToText, isDoingTextToSpeech]);

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
