"use client";

import React, {
	useContext,
	useState,
	useMemo,
	useEffect,
	useRef,
	useCallback,
} from "react";
import DialectContext from "@/context/dialectContext";
import { useLogger } from "@/hooks/useLogger";
import _ from "lodash";
import { useAudioService } from "@/hooks/useAudioService";
import { useChatService } from "@/hooks/useChatService";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Transition } from "@headlessui/react";

import Microphone from "@/components/shared/Microphone";
import { useRecording } from "@/hooks/useRecording";

import ChatBubble from "@/components/shared/ChatBubble";
import { cn } from "@/lib/utils";
import { cairo, roboto } from "@/lib/fonts";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import {
	BookOpenIcon,
	BookOpenSolidIcon,
	MagicWandIcon,
	PlayIcon,
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

import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import PulseLoader from "react-spinners/PulseLoader";
import { useToast } from "@/components/ui/use-toast";
import { useMessages } from "@/hooks/useMessages";
import SkewLoader from "react-spinners/SkewLoader";
import { ToastAction } from "@radix-ui/react-toast";
import { IMessage } from "@/lib/database/models/message.model";
import { useUser } from "@clerk/nextjs";

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
const ConversationIdPage = ({
	params: { conversationId },
}: {
	params: { conversationId: string };
}) => {
	const logger = useLogger({ label: "ConversationIdPage", color: "#fe7de9" });

	const { toast, dismiss } = useToast();

	const { arabicDialect } = useContext(DialectContext);

	const { user } = useUser();

	const {
		isPending,
		error,
		messages,
		createMessage,
		deleteAllMessagesAfterTimeStamp,
		refetch,
	} = useMessages({
		conversationId,
	});

	const [displayedChatMessageInd, setDisplayedChatMessageInd] =
		useState<number>(0);

	useEffect(() => {
		setDisplayedChatMessageInd(messages.length - 1);
	}, [messages]);

	const [timeStamp, setTimeStamp] = useState<Date | null>();

	const isChatEmpty = _.isEmpty(messages);

	const displayedChatMessage = messages[displayedChatMessageInd];

	const [activeTask, setActiveTask] = useState<Task | null>(null);
	// only to be used in onRecordingComplete since it has a closure over the activeTask state
	const activeTaskRef = useRef<Task | null>(null);
	activeTaskRef.current = activeTask;

	const [progressBarValue, setProgressBarValue] = useState(0);
	const progressBarValueRef = useRef<number>();
	progressBarValueRef.current = progressBarValue;

	const { makeChatCompletion, abortMakeChatCompletion } = useChatService();
	const {
		speechToText,
		textToSpeech,
		abortSpeechToTextRequest,
		abortTextToSpeechRequest,
	} = useAudioService();

	const { playAudio, isPlaying, initAudioElement, stopPlaying } =
		useAudioPlayer();

	const [showLoadingMessage, setShowLoadingMessage] = useState(false);

	const onRecordingComplete = useCallback(
		async (audioBlob: Blob) => {
			try {
				// 1. transcribe the user audio
				setActiveTask(taskEnum.SPEECH_TO_TEXT);
				const { transcription } = await speechToText(audioBlob);
				setProgressBarValue(25);
				// update database with user message
				await createMessage({ role: "user", content: transcription });

				// show loading message
				setShowLoadingMessage(true);

				// // 2. add user transcription to chat completion
				setActiveTask(taskEnum.ASSISTANT);
				const { messages: updatedMessages } = await makeChatCompletion(
					{
						role: "user",
						content: transcription,
					},
					messages.map((m) => ({ role: m.role, content: m.content }))
				);
				await createMessage(_.last(updatedMessages) as IMessage);

				// 3. convert the assistants response to audio
				setProgressBarValue(75);
				setActiveTask(taskEnum.TEXT_TO_SPEECH);
				const { base64Audio } = await textToSpeech(
					(_.last(updatedMessages) as IMessage).content
				);

				// 4. play assistants response and update message database
				setProgressBarValue(100);
				setActiveTask(null);
				setShowLoadingMessage(false);
				// setChatHistoryWithTypewriterOnLatestMessage(updatedChatHistory);
				await playAudio(base64Audio);
				setProgressBarValue(0);
				setTimeStamp(null);
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
				if (isPlaying) {
					stopPlaying();
				}

				setActiveTask(null);
				setProgressBarValue(0);

				await deleteAllMessagesAfterTimeStamp(timeStamp as Date);

				setShowLoadingMessage(false);

				setTimeout(() => {
					dismiss();
					setTimeStamp(null);
				}, 10000);

				// propagate the error so that the recording can be stopped
				throw error;
			}
		},
		[
			makeChatCompletion,
			createMessage,
			dismiss,
			isPlaying,
			logger,
			speechToText,
			stopPlaying,
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
			setTimeStamp(new Date());
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
				abortMakeChatCompletion();
				break;
			default:
				break;
		}
	}, [
		STATUS,
		abortMakeChatCompletion,
		abortSpeechToTextRequest,
		abortTextToSpeechRequest,
		activeTask,
	]);

	// const [completedTyping, setCompletedTyping] = useState(false);
	// const [skipTyping, setSkipTyping] = useState(false);
	// const skipTypingRef = useRef(false);
	// skipTypingRef.current = skipTyping;

	const stopPlayingBtnHandler = useCallback(() => {
		stopPlaying();
		// setSkipTyping(true);
	}, [stopPlaying]);

	// const setChatHistoryWithTypewriterOnLatestMessage = async (
	// 	chatHistory: ChatMessage[]
	// ) => {
	// 	const previousChatHistory = chatHistory.slice(0, -1);
	// 	const latestChatMessage = _.last(chatHistory) as ChatMessage;

	// 	setCompletedTyping(false);

	// 	let i = 0;

	// 	const promise = new Promise<void>((resolve) => {
	// 		const intervalId = setInterval(() => {
	// 			if (skipTypingRef.current) {
	// 				setChatHistory([
	// 					...previousChatHistory,
	// 					{
	// 						...latestChatMessage,
	// 						content: latestChatMessage.content,
	// 					},
	// 				]);
	// 				setCompletedTyping(true);
	// 				clearInterval(intervalId);
	// 				setSkipTyping(false);
	// 				resolve();
	// 				return;
	// 			}

	// 			setChatHistory([
	// 				...previousChatHistory,
	// 				{
	// 					...latestChatMessage,
	// 					content: latestChatMessage.content.slice(0, i),
	// 				},
	// 			]);
	// 			setDisplayedChatMessageInd(chatHistory.length - 1);

	// 			i++;

	// 			if (i > latestChatMessage.content.length) {
	// 				clearInterval(intervalId);
	// 				setCompletedTyping(true);

	// 				setTimeout(() => {
	// 					// wait a bit before resolving
	// 					resolve();
	// 				}, 750);
	// 			}
	// 		}, 40);
	// 	});

	// 	return promise;
	// 	// return () => clearInterval(intervalId);
	// };

	useEffect(() => {
		if (error) {
			toast({
				title: "Error loading messages",
				description:
					"There was a problem loading this conversation's messages.",
				variant: "destructive",
				action: (
					<ToastAction altText="Try again">
						<Button variant="secondary" onClick={() => refetch()}>
							Try again
						</Button>
					</ToastAction>
				),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error]);

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

	const paginationPrevDisabled = isPlaying || displayedChatMessageInd === 0;
	const paginationNextDisabled =
		isPlaying || displayedChatMessageInd === messages.length - 1;

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
				"text-center",
				cairo.className,
				// "font-extrabold text-2xl md:text-3xl tracking-tight",
				"text-xl tracking-tight",
				"text-transparent bg-clip-text bg-gradient-to-r to-araby-purple from-araby-blue py-4 text-gray-600"
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
			// innerClassName="bg-gradient-to-r to-araby-purple from-araby-purple"
			innerClassName="bg-gray-300"
			value={progressBarValueRef.current}
		/>
	);

	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	if (isPending) {
		return <></>;
	}

	if (error) {
		return (
			<div className="flex-1 flex items-center justify-center min-h-svh">
				<span>Error loading messages</span>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"w-full flex flex-col items-center justify-between max-w-3xl mx-auto px-4"
			)}
		>
			<div className="w-screen absolute top-0 left-0">{progressBarContent}</div>
			<div className="flex-1 min-h-0 basis-0 overflow-y-hidden flex flex-col justify-center items-center">
				{/* chat bubble and pagination wrapper */}
				<div className="flex flex-col justify-center items-center w-full h-full">
					<div className="min-h-0 w-full md:w-auto max-w-3xl mx-auto mt-8">
						{showLoadingMessage && (
							<ChatBubble
								className="h-full"
								name="ArabyBuddy"
								avatarSrc="/assets/arabybuddy.svg"
								avatarAlt="ArabyBuddy avatar"
								chatMenuDisabled
								reverse
								rtl
								content={
									<span className={cn("text-xl leading-loose text-slate-900")}>
										<PulseLoader
											// color="#5E17EB"
											color="black"
											loading
											cssOverride={{
												display: "block",
												margin: "0",
												width: 250,
											}}
											size={6}
											aria-label="Loading Spinner"
											data-testid="loader"
										/>
									</span>
								}
							/>
						)}
						{!isChatEmpty && !showLoadingMessage && (
							<ChatBubble
								className="h-full"
								name={
									displayedChatMessage?.role === "assistant"
										? "ArabyBuddy"
										: "You"
								}
								avatarSrc={
									displayedChatMessage?.role === "assistant"
										? "/assets/arabybuddy.svg"
										: user?.imageUrl ?? "/assets/user.svg"
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
											// "text-xl md:text-3xl text-transparent bg-clip-text leading-loose text-slate-900",
											"text-xl leading-loose text-slate-900 overflow-y-scroll",
											cairo.className
											// isPlaying &&
											// 	"bg-gradient-to-r to-araby-purple from-araby-purple"
										)}
									>
										{displayedChatMessage?.content}
									</span>
								}
							/>
						)}
					</div>
					{!isChatEmpty && !showLoadingMessage && paginationContent}
				</div>
			</div>
			<div className="w-fit ">
				<div className={cn("w-max")}>
					{STATUS === statusEnum.PROCESSING && (
						<Button
							onClick={abortProcessingBtnHandler}
							variant="outline"
							size="lg"
							className="w-full md:w-fit"
						>
							Cancel
						</Button>
					)}
					{STATUS === statusEnum.PLAYING && (
						<Button
							onClick={stopPlayingBtnHandler}
							// variant="default"
							variant="outline"
							size="lg"
							className="w-full md:w-fit"
						>
							Stop Playing
						</Button>
					)}
					{instructionContent}
				</div>
				<div className="text-center w-fit m-auto pb-4">
					<Microphone
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

export default ConversationIdPage;
