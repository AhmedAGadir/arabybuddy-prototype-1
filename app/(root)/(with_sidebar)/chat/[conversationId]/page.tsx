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

import MessageCard from "@/components/shared/MessageCard";
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
// import { XCircleIcon } from "@heroicons/react/20/solid";

const statusEnum = {
	IDLE: "IDLE",
	RECORDING: "RECORDING",
	PLAYING: "PLAYING",
	PROCESSING: "PROCESSING",
} as const;

export type Status = (typeof statusEnum)[keyof typeof statusEnum];

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

	const [timeStamp, setTimeStamp] = useState<Date | null>();

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

	const {
		playAudio,
		isPlaying,
		initAudioElement,
		audioElementInitialized,
		stopPlaying,
	} = useAudioPlayer();

	const { isRecording, startRecording, stopRecording, amplitude } =
		useRecording();

	const [displayedMessageInd, setDisplayedMessageInd] = useState<number>(0);

	useEffect(() => {
		setDisplayedMessageInd(messages.length - 1);
	}, [messages]);

	const displayedMessage = messages[displayedMessageInd];

	const [showLoadingMessage, setShowLoadingMessage] = useState(false);

	const onRecordingComplete = useCallback(
		async (audioBlob: Blob) => {
			try {
				// sanitize audio blob - it cant be larger than 9.216 MB
				if (audioBlob.size > 9216000) {
					throw new Error("Audio is too long");
				}

				// 1. transcribe the user audio
				setProgressBarValue(1);
				setActiveTask(taskEnum.SPEECH_TO_TEXT);
				const { transcription } = await speechToText(audioBlob);

				// sanitize transcription, no input should be empty

				setProgressBarValue(25);
				// copy current messages before updating the db
				const messagesCopy = messages.map(({ role, content }) => ({
					role,
					content,
				}));
				// update database with user message in the background
				createMessage({ role: "user", content: transcription });

				// show loading message
				setShowLoadingMessage(true);

				// // 2. add user transcription to chat completion
				setActiveTask(taskEnum.ASSISTANT);
				const { messages: updatedMessages } = await makeChatCompletion(
					{
						role: "user",
						content: transcription,
					},
					messagesCopy
				);
				// update database with assistant message in the background
				createMessage(_.last(updatedMessages) as IMessage);

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

				return { success: true };
			} catch (error) {
				if ((error as any).name === "AbortError") {
					toast({
						title: "Message cancelled",
						description: "The request was aborted.",
						className: "warning-toast",
						duration: 10000,
					});
				} else {
					logger.error("onRecordingComplete failed", error);
					toast({
						title: "Uh oh! Something went wrong.",
						description: "There was a problem with your request.",
						// variant: "destructive",
						className: "error-toast",
						duration: 10000,
					});
				}
				if (isPlaying) {
					stopPlaying();
				}

				setActiveTask(null);
				setProgressBarValue(0);

				await deleteAllMessagesAfterTimeStamp(timeStamp as Date);

				setShowLoadingMessage(false);

				setTimeStamp(null);

				return { success: false };
			}
		},
		[
			makeChatCompletion,
			createMessage,
			isPlaying,
			logger,
			speechToText,
			stopPlaying,
			toast,
			deleteAllMessagesAfterTimeStamp,
			messages,
			playAudio,
			textToSpeech,
			timeStamp,
		]
	);

	const replayDisplayedMessage = useCallback(async () => {
		try {
			setProgressBarValue(25);
			setActiveTask(taskEnum.TEXT_TO_SPEECH);
			const { base64Audio } = await textToSpeech(displayedMessage.content);

			setProgressBarValue(100);
			setActiveTask(null);

			if (!audioElementInitialized) {
				initAudioElement();
			}
			await playAudio(base64Audio);
			setProgressBarValue(0);
		} catch (error) {
			if ((error as any).name === "AbortError") {
				toast({
					title: "Message cancelled",
					description: "The request was aborted.",
					className: "warning-toast",
					duration: 10000,
				});
			} else {
				logger.error("replayDisplayedMessage", error);
				toast({
					title: "Uh oh! Something went wrong.",
					description: "There was a problem replaying this message",
					className: "error-toast",
					duration: 10000,
				});
			}

			setActiveTask(null);
			setProgressBarValue(0);
		}
	}, [
		displayedMessage,
		error,
		logger,
		initAudioElement,
		playAudio,
		textToSpeech,
		toast,
		audioElementInitialized,
	]);

	const toggleRecording = useCallback(async () => {
		setShowInstruction(false);
		if (isRecording) {
			const { audioBlob } = await stopRecording();
			if (audioBlob) {
				const { success } = await onRecordingComplete(audioBlob);
				if (success) {
					// TODO: disabling this for now, the UI is confusing
					// restart recording
					// startRecording();
				}
			}
			return;
		}

		if (!isRecording) {
			if (!audioElementInitialized) {
				initAudioElement();
			}
			setTimeStamp(new Date());
			startRecording();
			return;
		}
	}, [
		audioElementInitialized,
		initAudioElement,
		isRecording,
		onRecordingComplete,
		startRecording,
		stopRecording,
	]);

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
		const instructions: {
			[key in Status]: string[];
		} = {
			// idle: "Press ⬇️ the blue blob to start recording",
			IDLE: ["Click the blob to start recording"],
			RECORDING: [
				"Click again to stop recording",
				"Say something in Arabic...",
			],
			PLAYING: [""],
			PROCESSING: [""],
		};

		const statusInstructions = instructions[STATUS];
		const randomIndex = Math.floor(Math.random() * statusInstructions.length);
		return statusInstructions[randomIndex];
	}, [STATUS]);

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
		if (!isPending && error) {
			toast({
				title: "Error loading messages",
				description: "An error occurred while this conversation's messages.",
				action: (
					<ToastAction altText="Try again">
						<Button variant="outline" onClick={() => refetch()}>
							Try again
						</Button>
					</ToastAction>
				),
				className: "error-toast",
				duration: Infinity,
			});
		}
	}, [isPending, error, refetch, toast]);

	const chatMenuItems = useMemo(() => {
		return [
			{ label: "Replay", icon: PlayIcon, onClick: replayDisplayedMessage },
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
	}, [replayDisplayedMessage]);

	const paginationPrevDisabled = isPlaying || displayedMessageInd === 0;
	const paginationNextDisabled =
		isPlaying || displayedMessageInd === messages.length - 1;

	const paginationContent = (
		<Pagination className="mt-3">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						onClick={() => setDisplayedMessageInd(displayedMessageInd - 1)}
						className={cn(
							paginationPrevDisabled &&
								"pointer-events-none opacity-25 hover:bg-transparent"
						)}
					/>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext
						onClick={() => setDisplayedMessageInd(displayedMessageInd + 1)}
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
			className="rounded-none h-1"
			// innerClassName="bg-gradient-to-r to-araby-purple from-araby-purple"
			innerClassName="bg-araby-blue"
			value={progressBarValueRef.current}
		/>
	);

	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	if (isPending) {
		return (
			<div className="flex-1 flex items-center justify-center background-texture">
				<SkewLoader
					color="black"
					loading
					size={20}
					aria-label="Loading Spinner"
					data-testid="loader"
				/>
			</div>
		);
	}

	if (error) {
		return null;
	}

	const isChatEmpty = _.isEmpty(messages);

	return (
		<div className={cn("w-full background-texture")}>
			<div className="w-screen absolute top-0 left-0 z-30">
				{progressBarContent}
			</div>
			{/* wrapper */}
			<div className="h-full flex flex-col items-center justify-between mx-auto">
				<div className="flex-1 min-h-0 basis-0 overflow-y-hidden flex flex-col justify-center items-center px-4 w-full ">
					{/* chat bubble and pagination wrapper */}
					<div className="flex flex-col justify-center items-center w-full h-full ">
						<div className={cn("min-h-0 w-full max-w-2xl mx-auto mt-4 ")}>
							{showLoadingMessage && (
								<MessageCard
									className="h-full bg-white"
									name="ArabyBuddy"
									avatarSrc="/assets/arabybuddy.svg"
									avatarAlt="ArabyBuddy avatar"
									chatMenuDisabled
									reverse
									rtl
									content={
										<span
											className={cn("text-xl leading-loose text-slate-900")}
										>
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
								<MessageCard
									className="h-full bg-white"
									name={
										displayedMessage?.role === "assistant"
											? "ArabyBuddy"
											: "You"
									}
									avatarSrc={
										displayedMessage?.role === "assistant"
											? "/assets/arabybuddy.svg"
											: user?.imageUrl ?? "/assets/user.svg"
									}
									avatarAlt={
										displayedMessage?.role === "assistant"
											? "ArabyBuddy avatar"
											: "User avatar"
									}
									glow={isPlaying}
									chatMenuItems={chatMenuItems}
									chatMenuDisabled={STATUS !== statusEnum.IDLE}
									// showLoadingOverlay={activeTask === taskEnum.TEXT_TO_SPEECH}
									showLoadingOverlay={STATUS === statusEnum.PROCESSING}
									reverse
									rtl
									content={
										<span
											className={
												cn()
												// "font-bold",
												// "text-xl md:text-3xl text-transparent bg-clip-text leading-loose text-slate-900",
												// "text-xl leading-loose text-slate-900",
												// cairo.className
												// isPlaying &&
												// 	"bg-gradient-to-r to-araby-purple from-araby-purple"
												// "text-slate-900",
												// activeTask === taskEnum.TEXT_TO_SPEECH &&
												// 	"text-gray-300"
											}
										>
											{displayedMessage?.content}
										</span>
									}
								/>
							)}
						</div>
						{!isChatEmpty && !showLoadingMessage && paginationContent}
					</div>
				</div>
				<div className=" w-full px-4">
					<div className="h-12 mx-auto z-10 text-center ">
						{STATUS === statusEnum.PROCESSING && (
							<Button
								onClick={abortProcessingBtnHandler}
								// variant="outline"
								variant="destructive"
								size="lg"
								className="w-full md:w-fit"
							>
								Cancel
							</Button>
						)}
						{STATUS === statusEnum.PLAYING && (
							<Button
								onClick={stopPlayingBtnHandler}
								variant="default"
								// variant="outline"
								size="lg"
								className="w-full md:w-fit"
							>
								Stop Playing
							</Button>
						)}
						{/* {isRecording && (
						// <Button variant="link">
						// 	<XCircleIcon className="text-red-500 w-16 h-16" />
						// </Button>
						<Button
							onClick={() => stopRecording({ force: true })}
							// variant="default"
							variant="outline"
							size="lg"
							className="w-full md:w-fit"
						>
							Stop Recording
						</Button>
					)} */}
					</div>
					<div className="h-14 ">{instructionContent}</div>
					<div className="text-center w-fit m-auto pb-4 ">
						<Microphone
							onClick={toggleRecording}
							mode={STATUS}
							disabled={
								STATUS === statusEnum.PROCESSING ||
								STATUS === statusEnum.PLAYING
							}
							amplitude={amplitude}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConversationIdPage;
