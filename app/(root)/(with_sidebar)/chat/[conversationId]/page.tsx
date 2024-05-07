"use client";

import React, {
	useState,
	useMemo,
	useEffect,
	useRef,
	useCallback,
} from "react";

import Image from "next/image";

import { useLogger } from "@/hooks/useLogger";
import { useAudioService } from "@/hooks/useAudioService";
import { useChatService } from "@/hooks/useChatService";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useRecording } from "@/hooks/useRecording";
import { useMessages } from "@/hooks/useMessages";
import { useConversations } from "@/hooks/useConversations";

import { Button } from "@/components/ui/button";

import {
	ArrowPathIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisVerticalIcon,
	MicrophoneIcon as MicrophoneIconOutline,
	SparklesIcon,
	SpeakerWaveIcon,
} from "@heroicons/react/24/outline";

import { useToast } from "@/components/ui/use-toast";

import { Progress } from "@/components/ui/progress";

import Microphone from "@/components/shared/Microphone";
import MessageCard from "@/components/shared/MessageCard";

import PulseLoader from "react-spinners/PulseLoader";
import SkewLoader from "react-spinners/SkewLoader";
import ScaleLoader from "react-spinners/ScaleLoader";
import { ToastAction } from "@radix-ui/react-toast";

import { IMessage } from "@/lib/database/models/message.model";
import { useUser } from "@clerk/nextjs";

import SupportCard from "@/components/shared/SupportCard";

import { useMediaQuery } from "@react-hooks-hub/use-media-query";
import {
	BookOpenIcon,
	BookOpenSolidIcon,
	MagicWandIcon,
	PlayIcon,
	TranslateIcon,
} from "@/components/shared/icons";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

import _, { set } from "lodash";
import { Transition } from "@headlessui/react";

import { cn } from "@/lib/utils";
import { cairo } from "@/lib/fonts";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import {
	StopIcon,
	StopCircleIcon,
	XCircleIcon,
	MicrophoneIcon as MicrophoneIconSolid,
} from "@heroicons/react/20/solid";
import { Card, CardContent } from "@/components/ui/card";
import { text } from "stream/consumers";
import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePathname, useSearchParams } from "next/navigation";

const status = {
	IDLE: "IDLE",
	RECORDING: "RECORDING",
	PLAYING: "PLAYING",
	PROCESSING: "PROCESSING",
} as const;

export type Status = (typeof status)[keyof typeof status];

const task = {
	SPEECH_TO_TEXT: "SPEECH_TO_TEXT",
	ASSISTANT: "ASSISTANT",
	ASSISTANT_REGENERATE: "ASSISTANT_REGENERATE",
	ASSISTANT_REPHRASE: "ASSISTANT_REPHRASE",
	TEXT_TO_SPEECH: "TEXT_TO_SPEECH",
	TEXT_TO_SPEECH_REPLAY: "TEXT_TO_SPEECH_REPLAY",
} as const;

export type Task = (typeof task)[keyof typeof task];

const NewBadge = ({ className }: { className?: string }) => (
	<span
		className={cn(
			"inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20",
			className
		)}
	>
		New
	</span>
);

type IconType = React.FC<any> | (() => JSX.Element);

interface BasePanelItem {
	label: string;
	disabled: boolean;
	icon: IconType;
	iconClasses?: string;
	new?: boolean;
}

interface ButtonPanelItem extends BasePanelItem {
	onClick: () => void;
	toggle?: never;
	pressed?: never;
	onPressed?: never;
}

interface TogglePanelItem extends BasePanelItem {
	toggle: boolean;
	pressed: boolean;
	onPressed: (pressed: boolean) => void;
	onClick?: never;
}

type PanelItem = ButtonPanelItem | TogglePanelItem;

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
		updateMessage,
		completeTyping,
		deleteMessages,
		refetch,
	} = useMessages({
		conversationId,
	});

	const { updateConversation, deleteConversation } = useConversations();

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

	// const pathname = usePathname();
	// const searchParams = useSearchParams();

	// TODO: delete empty conversations when unmounting
	// useEffect(() => {
	// 	const url = `${pathname}?${searchParams}`;
	// 	logger.log("url", url);

	// 	return () => {
	// 		if (!url.includes(conversationId)) {
	// 			// redirect to the correct url
	// 			logger.log("unmounting conversationIdPage", conversationId);
	// 			// if (_.isEmpty(messages)) {
	// 			// 	try {
	// 			// 		deleteConversation(conversationId);
	// 			// 	} catch (error) {
	// 			// 		logger.error("deleteConversation failed", error);
	// 			// 		toast({
	// 			// 			title: "Something went wrong.",
	// 			// 			description: "There was a problem deleting this conversation.",
	// 			// 			// variant: "destructive",
	// 			// 			className: "error-toast",
	// 			// 			duration: 10000,
	// 			// 		});
	// 			// 	}
	// 			// }
	// 		}
	// 	};

	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [pathname, searchParams, conversationId]);

	const [timeStamp, setTimeStamp] = useState<Date | null>(null);

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
		logger.log("active task", activeTask);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTask]);

	// a hack to stop changing the displayed message when the user is updating a message
	const [updatingMessage, setUpdatingMessage] = useState(false);
	const updatingMessageRef = useRef<boolean>();
	updatingMessageRef.current = updatingMessage;

	useEffect(() => {
		if (updatingMessageRef.current) return;
		setDisplayedMessageInd(messages.length - 1);
	}, [messages]);

	const displayedMessage = messages[displayedMessageInd];

	const STATUS: Status = useMemo(() => {
		if (isRecording) return status.RECORDING;
		if (isPlaying) return status.PLAYING;
		if (activeTask !== null) return status.PROCESSING;
		return status.IDLE;
	}, [activeTask, isPlaying, isRecording]);

	const isProcessing = STATUS === status.PROCESSING;
	const isIdle = STATUS === status.IDLE;

	const isDoingSpeechToText = activeTask === task.SPEECH_TO_TEXT;
	const isDoingAssistant = activeTask === task.ASSISTANT;
	const isDoingAssistantRegenerate = activeTask === task.ASSISTANT_REGENERATE;
	const isDoingAssistantRephrase = activeTask === task.ASSISTANT_REPHRASE;
	const isDoingTextToSpeech = activeTask === task.TEXT_TO_SPEECH;
	const isDoingTextToSpeechReplay = activeTask === task.TEXT_TO_SPEECH_REPLAY;

	const abortProcessingBtnHandler = useCallback(() => {
		if (!isProcessing) return;
		switch (activeTask) {
			case task.SPEECH_TO_TEXT:
				abortSpeechToTextRequest();
				break;
			case task.TEXT_TO_SPEECH:
			case task.TEXT_TO_SPEECH_REPLAY:
				abortTextToSpeechRequest();
				break;
			case task.ASSISTANT:
			case task.ASSISTANT_REGENERATE:
			case task.ASSISTANT_REPHRASE:
				abortMakeChatCompletion();
				break;
			default:
				break;
		}
	}, [
		abortMakeChatCompletion,
		abortSpeechToTextRequest,
		abortTextToSpeechRequest,
		activeTask,
		isProcessing,
	]);

	const handleError = useCallback(
		(error: any, description = "There was a problem with your request.") => {
			if ((error as any).name === "AbortError") {
				toast({
					title: "Message cancelled",
					description: "The request was aborted.",
					className: "warning-toast",
					duration: 10000,
				});
			} else {
				toast({
					title: "Uh oh! Something went wrong.",
					description,
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
		},
		[isPlaying, stopPlaying, toast]
	);

	const handleSpeechToText = useCallback(
		async (audioBlob: Blob) => {
			setActiveTask(task.SPEECH_TO_TEXT);
			const { transcription } = await speechToText(audioBlob);
			setActiveTask(null);
			return { transcription };
		},
		[speechToText]
	);

	const handleMakeChatCompletion = useCallback(
		async (
			messageHistory: Pick<IMessage, "role" | "content">[],
			options?: { mode: "regenerate" | "rephrase" }
		) => {
			if (options?.mode === "regenerate") {
				setActiveTask(task.ASSISTANT_REGENERATE);
			} else if (options?.mode === "rephrase") {
				setActiveTask(task.ASSISTANT_REPHRASE);
			} else {
				setActiveTask(task.ASSISTANT);
			}
			const { messages: updatedMessages } = await makeChatCompletion(
				messageHistory,
				options
			);
			setActiveTask(null);
			const completionMessage = _.last(updatedMessages) as Pick<
				IMessage,
				"role" | "content"
			>;
			return { completionMessage };
		},
		[makeChatCompletion, setActiveTask]
	);

	const handleTextToSpeech = useCallback(
		async (text: string, options?: { replay: boolean }) => {
			if (options?.replay) {
				setActiveTask(task.TEXT_TO_SPEECH_REPLAY);
			} else {
				setActiveTask(task.TEXT_TO_SPEECH);
			}
			const { base64Audio } = await textToSpeech(text);
			setActiveTask(null);
			return { base64Audio };
		},
		[textToSpeech]
	);

	const handlePlayAudio = useCallback(
		async (base64Audio: string) => {
			if (!audioElementInitialized) {
				initAudioElement();
			}
			await playAudio(base64Audio);
		},
		[audioElementInitialized, initAudioElement, playAudio]
	);

	const onRecordingComplete = useCallback(
		async (audioBlob: Blob) => {
			try {
				// sanitize audio blob - it cant be larger than 9.216 MB
				if (audioBlob.size > 9216000) {
					throw new Error("Audio is too long");
				}

				setTimeStamp(new Date());

				// 1. transcribe the user audio
				setProgressBarValue(1);
				const { transcription } = await handleSpeechToText(audioBlob);

				// TODO: sanitize transcription, no input should be empty

				setProgressBarValue(25);
				// copy messages before updating the db
				const messageHistory = messages.map(({ role, content }) => ({
					role,
					content,
				}));

				// update database with user message in the foreground (optimistic update)
				await createMessage({ role: "user", content: transcription });

				// // 2. add user transcription to chat completion
				const { completionMessage } = await handleMakeChatCompletion([
					...messageHistory,
					{
						role: "user",
						content: transcription,
					},
				]);

				// 3. convert the assistants response to audio
				setProgressBarValue(75);
				const { base64Audio } = await handleTextToSpeech(
					completionMessage.content
				);
				// 4. play assistants response and update message database
				setProgressBarValue(100);
				// update database with user message in the background (optimistic update)
				createMessage(completionMessage);
				await handlePlayAudio(base64Audio);

				// update latest conversation in sidebar
				updateConversation({
					_id: conversationId,
					lastMessage: completionMessage.content,
				});
				setProgressBarValue(0);
				setTimeStamp(null);

				return { success: true };
			} catch (error) {
				logger.error("onRecordingComplete failed", error);

				handleError(error);

				const allMessageIdsAfterTimestamp = messages
					.filter(
						({ updatedAt }) =>
							timeStamp === null || new Date(updatedAt) > timeStamp
					)
					.map(({ _id }) => _id);

				await deleteMessages(allMessageIdsAfterTimestamp);
				setTimeStamp(null);

				return { success: false };
			}
		},
		[
			conversationId,
			createMessage,
			deleteMessages,
			handleError,
			logger,
			messages,
			timeStamp,
			updateConversation,
			handleMakeChatCompletion,
			handlePlayAudio,
			handleSpeechToText,
			handleTextToSpeech,
		]
	);

	const replayBtnHandler = useCallback(async () => {
		try {
			if (!displayedMessage) return;

			setProgressBarValue(25);
			const { base64Audio } = await handleTextToSpeech(
				displayedMessage.content,
				{ replay: true }
			);
			setProgressBarValue(100);
			await handlePlayAudio(base64Audio);
			setProgressBarValue(0);
		} catch (error) {
			logger.error("replayBtnHandler", error);
			handleError(error, "There was a problem replaying this message");
		}
	}, [
		handleTextToSpeech,
		displayedMessage,
		handlePlayAudio,
		logger,
		handleError,
	]);

	const stopPlayingHandler = useCallback(() => {
		if (isPlaying) {
			stopPlaying();
			completeTyping();
		}
	}, [completeTyping, isPlaying, stopPlaying]);

	const redoCompletionHandler = useCallback(
		async (options: { mode: "regenerate" | "rephrase" }) => {
			try {
				setProgressBarValue(25);

				const messageHistory = messages
					.map(({ role, content }) => ({
						role,
						content,
					}))
					.slice(0, displayedMessageInd);

				const messageIdsAfterDisplayedMessage = messages
					.slice(displayedMessageInd + 1)
					.map(({ _id }) => _id);

				const { completionMessage } = await handleMakeChatCompletion(
					[
						...messageHistory,
						{
							role: displayedMessage.role,
							content: displayedMessage.content,
						},
					],
					options
				);

				setProgressBarValue(75);

				// delete all messages after displayedMessage
				// await deleteMessages(messageIdsAfterDisplayedMessage);

				const { base64Audio } = await handleTextToSpeech(
					completionMessage.content
				);

				setUpdatingMessage(true);

				updateMessage({
					_id: displayedMessage._id,
					conversationId: conversationId,
					clerkId: displayedMessage.clerkId,
					...completionMessage,
				});
				await handlePlayAudio(base64Audio);

				setUpdatingMessage(false);

				updateConversation({
					_id: conversationId,
					lastMessage: completionMessage.content,
				});
				setProgressBarValue(0);
			} catch (error) {
				logger.error("redoCompletion", error);
				const errorMessages = {
					regenerate: "There was a problem regenerating this message",
					rephrase: "There was a problem rephrasing this message",
				};

				handleError(error, errorMessages[options.mode]);
			}
		},
		[
			conversationId,
			displayedMessage,
			displayedMessageInd,
			handleError,
			logger,
			messages,
			updateConversation,
			updateMessage,
			handleMakeChatCompletion,
			handlePlayAudio,
			handleTextToSpeech,
		]
	);

	const [drawerOpen, setDrawerOpen] = useState(false);

	const [dictionaryMode, setDictionaryMode] = useState(false);

	const dictionaryBtnHandler = useCallback(() => {
		console.log("dictionaryBtnHandler");
		setDictionaryMode((prev) => !prev);
	}, []);

	const translateBtnHandler = useCallback(async () => {
		setDrawerOpen((prev) => !prev);
	}, []);

	const toggleRecordingHandler = useCallback(async () => {
		setShowInstruction(false);

		if (isPlaying) {
			stopPlaying();
			return;
		}

		if (isRecording) {
			const { audioBlob } = await stopRecording();
			if (audioBlob) {
				const { success } = await onRecordingComplete(audioBlob);
				if (success) {
					// TODO: implement auto-restatart recording
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
			startRecording();
			return;
		}
	}, [
		audioElementInitialized,
		initAudioElement,
		isPlaying,
		isRecording,
		onRecordingComplete,
		startRecording,
		stopPlaying,
		stopRecording,
	]);

	const panelItems: PanelItem[] = useMemo(() => {
		return [
			{
				label: "Previous",
				// icon: ChevronLeftIcon,
				icon: () => <span>Prev</span>,
				onClick: () => setDisplayedMessageInd(displayedMessageInd - 1),
				disabled: !displayedMessage || displayedMessageInd === 0 || isRecording,
			},
			...(isIdle || isRecording
				? [
						{
							label: "Replay",
							icon: PlayIcon,
							onClick: replayBtnHandler,
							disabled: !displayedMessage || !isIdle,
						},
				  ]
				: []),
			...(isProcessing
				? [
						{
							label: "Cancel",
							icon: XCircleIcon,
							iconClasses: "text-destructive w-8 h-8",
							onClick: abortProcessingBtnHandler,
							disabled: false,
						},
				  ]
				: []),
			...(isPlaying
				? [
						{
							label: "Stop Playing",
							icon: StopIcon,
							iconClasses: "text-indigo-600 w-8 h-8",
							onClick: stopPlayingHandler,
							disabled: false,
						},
				  ]
				: []),
			...(displayedMessage && displayedMessage.role === "user"
				? [
						{
							label: "Rephrase",
							// icon: MagicWandIcon,
							icon: SparklesIcon,
							new: true,
							onClick: () => redoCompletionHandler({ mode: "rephrase" }),
							disabled: !displayedMessage || !isIdle,
						},
				  ]
				: [
						{
							label: "Regenerate",
							icon: ArrowPathIcon,
							onClick: () => redoCompletionHandler({ mode: "regenerate" }),
							disabled: !displayedMessage || !isIdle,
						},
				  ]),
			{
				label: "Record",
				onClick: toggleRecordingHandler,
				icon: isRecording ? MicrophoneIconSolid : MicrophoneIconOutline,
				// toggle: true,
				// pressed: isRecording,
				// onPressed: toggleRecordingHandler,
				// icon: MicrophoneIconOutline,
				disabled: isProcessing,
			},
			{
				label: "Dictionary",
				toggle: true,
				pressed: dictionaryMode,
				onPressed: dictionaryBtnHandler,
				icon: BookOpenIcon,
				disabled: !displayedMessage || !isIdle,
			},
			{
				label: "Translate",
				icon: TranslateIcon,
				onClick: translateBtnHandler,
				disabled: !displayedMessage || !isIdle,
			},
			{
				label: "Next",
				// icon: ChevronRightIcon,
				icon: () => <span>Next</span>,
				onClick: () => setDisplayedMessageInd(displayedMessageInd + 1),
				disabled:
					!displayedMessage ||
					displayedMessageInd === messages.length - 1 ||
					isRecording,
			},
		];
	}, [
		displayedMessage,
		displayedMessageInd,
		isRecording,
		isIdle,
		replayBtnHandler,
		isProcessing,
		abortProcessingBtnHandler,
		isPlaying,
		stopPlayingHandler,
		toggleRecordingHandler,
		dictionaryMode,
		dictionaryBtnHandler,
		translateBtnHandler,
		messages.length,
		redoCompletionHandler,
	]);

	const panelItemsContent = (
		<Card className="shadow-lg p-2">
			<CardContent className="flex items-center p-0">
				<div className="flex gap-2">
					{panelItems.map((item) => {
						return (
							<TooltipProvider key={item.label} delayDuration={0}>
								<Tooltip>
									<TooltipTrigger asChild>
										<>
											{item.toggle && (
												<Toggle
													size="default"
													className={
														cn(
															"h-11 w-11 sm:h-14 sm:w-14 text-slate-500 dark:text-slate-400 hover:bg-slate-100",
															"data-[state=on]:bg-primary data-[state=on]:text-white hover:data-[state=on]:bg-primary/80 px-2 "
														)
														// "relative text-slate-500 dark:text-slate-400 hover:bg-slate-100",
														// item.pressed && "bg-slate-400"
													}
													pressed={item.pressed}
													onPressedChange={item.onPressed}
													disabled={item.disabled}
												>
													<item.icon
														className={cn("w-6 h-6", item.iconClasses)}
													/>
												</Toggle>
											)}
											{!item.toggle && (
												<Button
													size="icon"
													variant="ghost"
													className="relative h-11 w-11 sm:h-14 sm:w-14 text-slate-500 dark:text-slate-400 hover:bg-slate-100"
													onClick={item.onClick}
													disabled={item.disabled}
												>
													<item.icon
														className={cn("w-6 h-6", item.iconClasses)}
													/>
												</Button>
											)}
										</>
									</TooltipTrigger>
									<TooltipContent side="bottom" align="start">
										<span>{item.label}</span>
										{item.new && <NewBadge className="ml-2" />}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);

	const displayedMessageContent =
		dictionaryMode && STATUS === status.IDLE ? (
			<div className="flex flex-wrap gap-2">
				{
					// filter out anything that is not a word, remember were not only using english
					_.words(
						displayedMessage?.content.replace(
							/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~?]/g,
							""
						)
					).map((word, i) => (
						<Badge
							key={`${word}_${i}`}
							variant="secondary"
							className="text-lg cursor-pointer hover:bg-primary hover:text-white"
							onClick={() => setDrawerOpen(true)}
						>
							{word}
						</Badge>
					))
				}
			</div>
		) : (
			displayedMessage?.content
		);

	const ellipsesButton = (
		<Button
			size="icon"
			variant="ghost"
			className={cn(
				"hover:bg-slate-100",
				true && "opacity-50 hover:bg-transparent pointer-events-none"
			)}
		>
			<EllipsisVerticalIcon className="text-slate-500 dark:text-slate-400 w-6 h-6" />
		</Button>
	);

	const [showInstruction, setShowInstruction] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setShowInstruction(true);
		}, 1000);
	}, [isRecording]);

	const instruction = useMemo(() => {
		const instructions: {
			[key in Status]: string[];
		} = {
			// idle: "Press ⬇️ the blue blob to start recording",
			IDLE: ["Click the microphone to start recording"],
			RECORDING: [
				"Listening...",
				"Click again to stop recording",
				"Say something in Arabic...",
			],
			PLAYING: [""],
			PROCESSING: [
				...(isDoingSpeechToText ? ["Transcribing..."] : []),
				...(isDoingAssistant ? ["Thinking of a response..."] : []),
				...(isDoingTextToSpeech ? ["Preparing audio..."] : []),
				...(isDoingTextToSpeechReplay ? ["Regenerating audio..."] : []),
				...(isDoingAssistantRegenerate ? ["Regenerating response..."] : []),
				...(isDoingAssistantRephrase
					? ["Rephrasing your message to make it sound more natural..."]
					: []),
			],
		};

		const statusInstructions = instructions[STATUS];
		const randomIndex = Math.floor(Math.random() * statusInstructions.length);
		return statusInstructions[randomIndex];
	}, [
		STATUS,
		isDoingAssistant,
		isDoingAssistantRephrase,
		isDoingAssistantRegenerate,
		isDoingSpeechToText,
		isDoingTextToSpeech,
		isDoingTextToSpeechReplay,
	]);

	const instructionContent = (
		<Transition
			className={cn(
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

	const isChatEmpty = _.isEmpty(messages);

	const messageCardDetails = useMemo(() => {
		let name: string, avatarSrc: string, avatarAlt: string;

		const userDetails = {
			name: "You",
			avatarSrc: user?.imageUrl ?? "/assets/user.svg",
			avatarAlt: "User avatar",
		};

		const arabyBuddyDetails = {
			name: "ArabyBuddy",
			avatarSrc: "/assets/arabybuddy.svg",
			avatarAlt: "ArabyBuddy avatar",
		};

		if (false) {
			if (isDoingSpeechToText) {
				name = userDetails.name;
				avatarSrc = userDetails.avatarSrc;
				avatarAlt = userDetails.avatarAlt;
			} else {
				name = arabyBuddyDetails.name;
				avatarSrc = arabyBuddyDetails.avatarSrc;
				avatarAlt = arabyBuddyDetails.avatarAlt;
			}
		} else {
			if (displayedMessage?.role === "assistant") {
				name = arabyBuddyDetails.name;
				avatarSrc = arabyBuddyDetails.avatarSrc;
				avatarAlt = arabyBuddyDetails.avatarAlt;
			} else {
				name = userDetails.name;
				avatarSrc = userDetails.avatarSrc;
				avatarAlt = userDetails.avatarAlt;
			}
		}

		return {
			name,
			avatarSrc,
			avatarAlt,
		};
	}, [displayedMessage?.role, isDoingSpeechToText, user?.imageUrl]);

	const menuContent = useMemo(() => {
		if (isPlaying) {
			// <SpeakerWaveIcon
			// 	className={cn(
			// 		"w-6 h-6 text-slate-400 hidden transition ease-in-out",
			// 		isPlaying && "block"
			// 	)}
			// />
			return (
				<ScaleLoader
					color="#b5bac4"
					loading
					height={20}
					cssOverride={{
						display: "block",
						margin: "0",
					}}
					speedMultiplier={1.5}
					aria-label="Loading Spinner"
					data-testid="loader"
				/>
			);
		}

		if (isRecording) {
			return (
				<span className="relative flex h-4 w-4">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0066] opacity-75"></span>
					<span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF0066]"></span>
				</span>
			);
		}

		return <span />;
	}, [isPlaying, isRecording]);

	const messageCardContent = !isChatEmpty && (
		<MessageCard
			className={cn(
				"h-full bg-white text-slate-900 dark:text-white"
				// isPlaying &&
				// 	"text-transparent bg-clip-text bg-gradient-to-r to-indigo-500 from-sky-500 shadow-blue-500/50"
			)}
			name={messageCardDetails.name}
			avatarSrc={messageCardDetails.avatarSrc}
			avatarAlt={messageCardDetails.avatarAlt}
			// glow={isPlaying}
			showLoadingOverlay={STATUS === status.PROCESSING}
			menuContent={menuContent}
			content={
				false ? (
					<PulseLoader
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
						speedMultiplier={0.75}
					/>
				) : (
					<div>{displayedMessageContent}</div>
				)
			}
		/>
	);

	const drawerContent = (
		<Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
			{/* <DrawerTrigger asChild>
				<Button variant="outline">Open Drawer</Button>
			</DrawerTrigger> */}
			<DrawerContent>
				<div className="mx-auto w-full max-w-sm">
					<DrawerHeader>
						<DrawerTitle>Move Goal</DrawerTitle>
						<DrawerDescription>Set your daily activity goal.</DrawerDescription>
					</DrawerHeader>
					<div className="p-4 pb-0">
						<div className="flex items-center justify-center space-x-2">
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8 shrink-0 rounded-full"
								onClick={() => {}}
								// disabled={goal <= 200}
							>
								<Minus className="h-4 w-4" />
								<span className="sr-only">Decrease</span>
							</Button>
							<div className="flex-1 text-center">
								<div className="text-7xl font-bold tracking-tighter">goal</div>
								<div className="text-[0.70rem] uppercase text-muted-foreground">
									Calories/day
								</div>
							</div>
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8 shrink-0 rounded-full"
								onClick={() => {}}
								// disabled={goal >= 400}
							>
								<Plus className="h-4 w-4" />
								<span className="sr-only">Increase</span>
							</Button>
						</div>
						<div className="mt-3 h-[120px]">
							<div> information</div>
						</div>
					</div>
					<DrawerFooter>
						<Button>Submit</Button>
						<DrawerClose asChild>
							<Button variant="outline">Cancel</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);

	if (isPending) {
		return (
			<div className="flex-1 flex items-center justify-center bg-g">
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

	return (
		<div className={cn("w-full background-texture")}>
			<div className="w-screen absolute top-0 left-0 z-30">
				{progressBarContent}
			</div>
			{/* wrapper */}
			<div className="h-full flex flex-col items-center justify-between mx-auto gap-4 py-4 md:pt-6">
				<div className="hidden md:block">{panelItemsContent}</div>
				{drawerContent}
				<div
					className={cn(
						"flex-1 min-h-0 basis-0 flex flex-col justify-center items-center px-4 w-full"
						// "overflow-y-hidden"
					)}
				>
					{/* chat bubble and pagination wrapper */}
					<div className="flex flex-col justify-center items-center w-full h-full ">
						<div className={cn("min-h-0 w-full max-w-2xl mx-auto")}>
							{messageCardContent}
						</div>
					</div>
				</div>
				<div className="relative w-full px-4">
					<div className="h-14 z-10 text-center">{instructionContent}</div>
					{/* <div className="h-14 ">{instructionContent}</div> */}
					{/* <div className="text-center w-fit m-auto">
						<Microphone
							onClick={toggleRecordingHandler}
							mode={STATUS}
							disabled={isProcessing}
							amplitude={amplitude}
						/>
					</div> */}
				</div>
				<div className="md:hidden mb-14">{panelItemsContent}</div>
				<SupportCard className="absolute bottom-0 right-0" />
			</div>
		</div>
	);
};

export default ConversationIdPage;
