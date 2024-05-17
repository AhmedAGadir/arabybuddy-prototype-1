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
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";

import {
	ArrowPathIcon,
	BookOpenIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisVerticalIcon,
	MicrophoneIcon as MicrophoneIconOutline,
	PlayIcon,
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

import { TranslateIcon } from "@/components/shared/icons/Translate";

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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCyclingText } from "@/hooks/useCyclingText";
import { nonWordCharactersRegExp } from "@/lib/constants";
import useTimestamp from "@/hooks/useTimestamp";
import {
	CompletionMode,
	OpenAIMessage,
	completionMode,
} from "@/lib/api/assistant";

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
	ASSISTANT_TRANSLATE: "ASSISTANT_TRANSLATE",
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

	const { updateConversation, deleteConversation } = useConversations();

	const {
		isPending,
		error,
		messages,
		createMessage,
		updateMessage,
		completeTyping,
		deleteMessages,
		refetch,
		upsertMessageInCache,
	} = useMessages({
		conversationId,
	});

	const { makeChatCompletionStream, abortMakeChatCompletionStream } =
		useChatService();
	const { speechToText, textToSpeech, abortSpeechToText, abortTextToSpeech } =
		useAudioService();

	const {
		playAudio,
		isPlaying,
		initAudioElement,
		audioElementInitialized,
		stopPlaying,
		currentTime,
	} = useAudioPlayer();

	const { isRecording, startRecording, stopRecording, amplitude } =
		useRecording();

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

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const displayedMessageInd =
		searchParams.get("ind") !== null ? Number(searchParams.get("ind")) : null;

	const updateDisplayedMessageInd = useCallback(
		(newIndex: number) => {
			const createQueryString = (name: string, value: string) => {
				const params = new URLSearchParams(searchParams.toString());
				params.set(name, value);

				return params.toString();
			};

			router.replace(
				pathname + "?" + createQueryString("ind", newIndex.toString())
			);
		},
		[pathname, router, searchParams]
	);

	useEffect(() => {
		// initialise to last message index
		if (searchParams.get("ind") === null && messages.length > 0) {
			logger.log("init displayedMessageInd to last message index");
			updateDisplayedMessageInd(messages.length - 1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messages]);

	const displayedMessage = useMemo(() => {
		// first load
		if (displayedMessageInd === null) return null;

		// if search params are out of bounds
		if (messages[displayedMessageInd] === undefined) return null;

		return messages[displayedMessageInd];
	}, [displayedMessageInd, messages]);

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

	const [activeTask, setActiveTask] = useState<Task | null>(null);

	useEffect(() => {
		logger.log("active task", activeTask);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTask]);

	const [progressBarValue, setProgressBarValue] = useState(0);
	// TODO: can remove this?
	const progressBarValueRef = useRef<number>();
	progressBarValueRef.current = progressBarValue;

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
	const isDoingAssistantTranslate = activeTask === task.ASSISTANT_TRANSLATE;
	const isDoingTextToSpeech = activeTask === task.TEXT_TO_SPEECH;
	const isDoingTextToSpeechReplay = activeTask === task.TEXT_TO_SPEECH_REPLAY;

	const instructions: {
		[key in Status]: string[];
	} = useMemo(
		() => ({
			// idle: "Press ⬇️ the blue blob to start recording",
			IDLE: [
				...(messages.length === 0 ? ["Welcome to ArabyBuddy!"] : []),
				"Click the microphone to start recording",
				"Ask a question or say something in Arabic...",
				// "هيا بنا",
			],
			RECORDING: [
				"Listening...",
				"Click again to stop recording",
				"Say something in Arabic...",
			],
			PLAYING: [""],
			PROCESSING: [
				...(isDoingSpeechToText ? ["Transcribing..."] : []),
				...(isDoingAssistant ? ["Generating a response..."] : []),
				...(isDoingTextToSpeech ? ["Preparing audio..."] : []),
				...(isDoingTextToSpeechReplay ? ["Regenerating audio..."] : []),
				...(isDoingAssistantRegenerate ? ["Regenerating response..."] : []),
				...(isDoingAssistantRephrase
					? ["Rephrasing your message to make it sound more natural..."]
					: []),
				...(isDoingAssistantTranslate ? ["Translating your message..."] : []),
			],
		}),
		[
			isDoingAssistant,
			isDoingAssistantRegenerate,
			isDoingAssistantRephrase,
			isDoingSpeechToText,
			isDoingTextToSpeech,
			isDoingTextToSpeechReplay,
			isDoingAssistantTranslate,
			messages.length,
		]
	);

	const {
		text: instruction,
		showText: showInstruction,
		hideText: hideInstruction,
	} = useCyclingText(instructions[STATUS]);

	const abortProcessingBtnHandler = useCallback(() => {
		if (!isProcessing) return;
		switch (activeTask) {
			case task.SPEECH_TO_TEXT:
				abortSpeechToText();
				break;
			case task.TEXT_TO_SPEECH:
			case task.TEXT_TO_SPEECH_REPLAY:
				abortTextToSpeech();
				break;
			case task.ASSISTANT:
			case task.ASSISTANT_REGENERATE:
			case task.ASSISTANT_REPHRASE:
			case task.ASSISTANT_TRANSLATE:
				abortMakeChatCompletionStream();
				break;
			default:
				break;
		}
	}, [
		abortMakeChatCompletionStream,
		abortSpeechToText,
		abortTextToSpeech,
		activeTask,
		isProcessing,
	]);

	const handleError = useCallback(
		(error: any, description = "There was a problem with your request.") => {
			if ((error as any).name === "AbortError") {
				toast({
					title: "Message cancelled",
					description: "The request was aborted.",
					className: "info-toast",
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

	const wordTimestampsRef = useRef<
		| {
				word: string;
				startTime: number;
				endTime: number;
		  }[]
		| null
	>(null);

	const handleMakeChatCompletion = useCallback(
		async (
			messageHistory: OpenAIMessage[],
			options: { mode: CompletionMode }
		) => {
			throw new Error("Not implemented");

			// switch (options.mode) {
			// 	case completionMode.REGENERATE:
			// 		setActiveTask(task.ASSISTANT_REGENERATE);
			// 		break;
			// 	case completionMode.REPHRASE:
			// 		setActiveTask(task.ASSISTANT_REPHRASE);
			// 		break;
			// 	case completionMode.TRANSLATE:
			// 		setActiveTask(task.ASSISTANT_TRANSLATE);
			// 		break;
			// 	default:
			// 		setActiveTask(task.ASSISTANT);
			// }

			// const { completionMessage } = await makeChatCompletion(
			// 	messageHistory,
			// 	options
			// );
			// setActiveTask(null);

			// return { completionMessage };
		},
		[]
	);

	const onRecordingComplete = useCallback(
		async (audioBlob: Blob) => {
			// await new Promise((resolve) => setTimeout(resolve, 3000));
			// throw new Error("Not implemented");
			try {
				// sanitize audio blob - it cant be larger than 9.216 MB
				if (audioBlob.size > 9216000) {
					throw new Error("Audio is too long");
				}

				setProgressBarValue(1);

				// TODO: sanitize transcription, no input should be empty
				setActiveTask(task.SPEECH_TO_TEXT);

				const { transcription } = await speechToText(audioBlob);

				const messageHistory = messages.map(({ role, content }) => ({
					role,
					content,
				}));

				let latestMessageInd = messageHistory.length - 1;

				latestMessageInd++;
				updateDisplayedMessageInd(latestMessageInd);

				await createMessage({
					role: "user",
					content: transcription,
				});

				setProgressBarValue(25);

				setActiveTask(task.ASSISTANT);

				const completionStream = await makeChatCompletionStream([
					...messageHistory,
					{
						role: "user",
						content: transcription,
					},
				]);

				const dateStr = new Date().toISOString();

				const completionMessage = {
					_id: nanoid(),
					clerkId: user!.id,
					conversationId,
					createdAt: dateStr,
					updatedAt: dateStr,
				} as IMessage;

				latestMessageInd++;
				updateDisplayedMessageInd(latestMessageInd);

				for await (const data of completionStream) {
					completionMessage.content = data.content;
					completionMessage.role = data.role;
					// update cache, well still need to update the database after
					await upsertMessageInCache(completionMessage);
				}

				setProgressBarValue(75);

				setActiveTask(task.TEXT_TO_SPEECH);

				const { base64Audio, wordData } = await textToSpeech(
					completionMessage.content
				);

				wordTimestampsRef.current = wordData;

				setProgressBarValue(100);

				if (!audioElementInitialized) {
					initAudioElement();
				}
				await playAudio(base64Audio);

				wordTimestampsRef.current = null;

				setActiveTask(null);

				await createMessage({
					role: completionMessage.role,
					content: completionMessage.content,
				});

				// // update latest conversation in sidebar
				updateConversation({
					_id: conversationId,
					lastMessage: completionMessage.content,
				});

				setProgressBarValue(0);

				return { success: true };
			} catch (error) {
				logger.error("onRecordingComplete failed", error);

				handleError(error);

				return { success: false };
			}
		},
		[
			speechToText,
			messages,
			updateDisplayedMessageInd,
			createMessage,
			makeChatCompletionStream,
			user,
			conversationId,
			logger,
			textToSpeech,
			audioElementInitialized,
			playAudio,
			updateConversation,
			upsertMessageInCache,
			initAudioElement,
			handleError,
		]
	);

	const replayBtnHandler = useCallback(async () => {
		try {
			if (!displayedMessage) return;

			setProgressBarValue(25);

			setActiveTask(task.TEXT_TO_SPEECH_REPLAY);

			const { base64Audio, wordData } = await textToSpeech(
				displayedMessage.content
			);
			setActiveTask(null);

			wordTimestampsRef.current = wordData;

			setProgressBarValue(100);

			if (!audioElementInitialized) {
				initAudioElement();
			}
			await playAudio(base64Audio);

			wordTimestampsRef.current = null;

			setActiveTask(null);

			setProgressBarValue(0);
		} catch (error) {
			logger.error("replayBtnHandler", error);
			handleError(error, "There was a problem replaying this message");
		}
	}, [
		displayedMessage,
		textToSpeech,
		audioElementInitialized,
		playAudio,
		initAudioElement,
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
		async (options: {
			mode: typeof completionMode.REGENERATE | typeof completionMode.REPHRASE;
		}) => {
			try {
				if (!displayedMessage) return;

				setProgressBarValue(25);

				const messageHistory = messages
					.map(({ role, content }) => ({
						role,
						content,
					}))
					.slice(0, displayedMessageInd ?? 0);

				setActiveTask(
					options.mode === completionMode.REGENERATE
						? task.ASSISTANT_REGENERATE
						: task.ASSISTANT_REPHRASE
				);

				const completionStream = await makeChatCompletionStream(
					[
						...messageHistory,
						{
							role: displayedMessage.role,
							content: displayedMessage.content,
						},
					],
					options
				);

				const completionMessage = {
					_id: displayedMessage._id,
					clerkId: displayedMessage.clerkId,
					conversationId: displayedMessage.conversationId,
					translation: undefined,
					createdAt: displayedMessage.createdAt,
					updatedAt: new Date().toISOString(),
				} as IMessage;

				for await (const data of completionStream) {
					completionMessage.content = data.content;
					completionMessage.role = data.role;
					// update cache, well still need to update the database after
					await upsertMessageInCache(completionMessage);
				}

				setProgressBarValue(75);

				setActiveTask(task.TEXT_TO_SPEECH);

				const { base64Audio, wordData } = await textToSpeech(
					completionMessage.content
				);

				wordTimestampsRef.current = wordData;

				setProgressBarValue(100);

				if (!audioElementInitialized) {
					initAudioElement();
				}
				await playAudio(base64Audio);

				wordTimestampsRef.current = null;

				setActiveTask(null);

				updateMessage({
					...displayedMessage,
					role: completionMessage.role,
					content: completionMessage.content,
				});

				updateConversation({
					_id: conversationId,
					lastMessage: completionMessage.content,
				});
				setProgressBarValue(0);
			} catch (error) {
				logger.error("redoCompletion", error);
				const errorMessages = {
					[completionMode.REGENERATE]:
						"There was a problem regenerating this message",
					[completionMode.REPHRASE]:
						"There was a problem rephrasing this message",
				};

				handleError(error, errorMessages[options.mode]);
			}
		},
		[
			displayedMessage,
			messages,
			displayedMessageInd,
			makeChatCompletionStream,
			conversationId,
			textToSpeech,
			audioElementInitialized,
			playAudio,
			updateMessage,
			updateConversation,
			upsertMessageInCache,
			initAudioElement,
			logger,
			handleError,
		]
	);

	const [showTranslation, setShowTranslation] = useState(false);

	const translateBtnHandler = useCallback(async () => {
		try {
			if (!displayedMessage) return;

			setShowTranslation(true);
			setProgressBarValue(25);

			setActiveTask(task.ASSISTANT_TRANSLATE);

			const completionStream = await makeChatCompletionStream(
				[
					{
						role: displayedMessage.role,
						content: displayedMessage.content,
					},
				],
				{ mode: completionMode.TRANSLATE }
			);

			const completionMessage = {
				_id: displayedMessage._id,
				clerkId: displayedMessage.clerkId,
				conversationId: displayedMessage.conversationId,
				createdAt: displayedMessage.createdAt,
				updatedAt: new Date().toISOString(),
			} as IMessage;

			for await (const data of completionStream) {
				completionMessage.translation = data.content;
				completionMessage.role = data.role;
				// update cache, well still need to update the database after
				await upsertMessageInCache(completionMessage);
			}

			setProgressBarValue(75);

			setActiveTask(task.TEXT_TO_SPEECH);

			const { base64Audio, wordData } = await textToSpeech(
				completionMessage.translation!
			);

			wordTimestampsRef.current = wordData;

			setProgressBarValue(100);

			if (!audioElementInitialized) {
				initAudioElement();
			}
			await playAudio(base64Audio);

			wordTimestampsRef.current = null;

			setActiveTask(null);

			await updateMessage(
				{
					...displayedMessage,
					translation: completionMessage.translation,
				},
				{
					mode: completionMode.TRANSLATE,
				}
			);

			setProgressBarValue(0);
		} catch (error) {
			logger.error("translateBtnHandler", error);

			handleError(error, "There was a problem translating this message");
		}
	}, [
		audioElementInitialized,
		displayedMessage,
		handleError,
		initAudioElement,
		logger,
		makeChatCompletionStream,
		playAudio,
		textToSpeech,
		updateMessage,
		upsertMessageInCache,
	]);

	const [drawerOpen, setDrawerOpen] = useState(false);

	const [dictionaryMode, setDictionaryMode] = useState(false);

	const toggleDictionaryHandler = useCallback(() => {
		setDictionaryMode((prev) => !prev);
	}, []);

	const toggleRecordingHandler = useCallback(async () => {
		hideInstruction();

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
		hideInstruction,
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
				onClick: () =>
					updateDisplayedMessageInd((displayedMessageInd ?? 0) - 1),
				disabled:
					!displayedMessage ||
					displayedMessageInd === 0 ||
					isRecording ||
					isPlaying,
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
							iconClasses: "text-white w-8 h-8",
							// onClick: abortProcessingBtnHandler,
							toggle: true,
							pressed: true,
							onPressed: abortProcessingBtnHandler,
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
							onClick: () =>
								redoCompletionHandler({ mode: completionMode.REPHRASE }),
							disabled: !displayedMessage || !isIdle,
						},
				  ]
				: [
						{
							label: "Regenerate",
							icon: ArrowPathIcon,
							onClick: () =>
								redoCompletionHandler({ mode: completionMode.REGENERATE }),
							disabled: !displayedMessage || !isIdle,
						},
				  ]),
			{
				label: "Record",
				toggle: true,
				pressed: isRecording,
				onPressed: toggleRecordingHandler,
				icon: MicrophoneIconOutline,
				disabled: isProcessing,
			},
			{
				label: "Dictionary",
				toggle: true,
				pressed: dictionaryMode,
				onPressed: toggleDictionaryHandler,
				icon: BookOpenIcon,
				disabled: !displayedMessage || !isIdle,
			},
			...(displayedMessage && displayedMessage.translation
				? [
						{
							label: "Translate",
							icon: TranslateIcon,
							toggle: true,
							pressed: showTranslation,
							onPressed: () => setShowTranslation((prev) => !prev),
							disabled: !isIdle,
						},
				  ]
				: [
						{
							label: "Translate",
							icon: TranslateIcon,
							onClick: translateBtnHandler,
							disabled: !displayedMessage || !isIdle,
						},
				  ]),
			{
				label: "Next",
				// icon: ChevronRightIcon,
				icon: () => <span>Next</span>,
				onClick: () =>
					updateDisplayedMessageInd((displayedMessageInd ?? 0) + 1),
				disabled:
					!displayedMessage ||
					displayedMessageInd === messages.length - 1 ||
					isRecording ||
					isPlaying,
			},
		];
	}, [
		displayedMessage,
		displayedMessageInd,
		isRecording,
		isPlaying,
		isIdle,
		replayBtnHandler,
		isProcessing,
		abortProcessingBtnHandler,
		stopPlayingHandler,
		toggleRecordingHandler,
		dictionaryMode,
		toggleDictionaryHandler,
		showTranslation,
		translateBtnHandler,
		messages.length,
		redoCompletionHandler,
		updateDisplayedMessageInd,
	]);

	const panelItemsContent = (
		<Card className="shadow-lg p-2">
			<CardContent className="flex items-center p-0">
				<div className="flex gap-2">
					{panelItems.map((item) => {
						return (
							<TooltipProvider key={item.label} delayDuration={0}>
								<Tooltip>
									<TooltipTrigger>
										<>
											{item.toggle && (
												<Toggle
													size="default"
													className={
														cn(
															"h-11 w-11 sm:h-14 sm:w-14 text-slate-500 dark:text-slate-400 hover:bg-slate-100",
															"data-[state=on]:bg-primary data-[state=on]:text-white hover:data-[state=on]:bg-primary/80 px-2"
															// "data-[state=on]:bg-slate-500 data-[state=on]:text-white hover:data-[state=on]:bg-slate-400 px-2 "
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

	const instructionContent = (
		<Transition
			className={cn(
				cairo.className,
				// "font-extrabold text-2xl md:text-3xl tracking-tight",
				"text-lg sm:text-xl tracking-tight",
				"text-transparent bg-clip-text bg-gradient-to-r to-araby-purple from-araby-blue py-4 text-gray-500"
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

	const messageCardDetails = useMemo(() => {
		if (displayedMessage?.role === "assistant") {
			return {
				name: "ArabyBuddy",
				avatarSrc: "/assets/arabybuddy.svg",
				avatarAlt: "ArabyBuddy avatar",
			};
		}
		return {
			name: "You",
			avatarSrc: user?.imageUrl ?? "/assets/user.svg",
			avatarAlt: "User avatar",
		};
	}, [displayedMessage?.role, user?.imageUrl]);

	const menuContent = useMemo(() => {
		if (isPlaying) {
			return (
				<SpeakerWaveIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 transition ease-in-out" />
			);
		}
		return <div />;
		// return (
		// 	<ScaleLoader
		// 		color="#b5bac4"
		// 		loading
		// 		height={20}
		// 		cssOverride={{
		// 			display: "block",
		// 			margin: "0",
		// 		}}
		// 		speedMultiplier={1.5}
		// 		aria-label="Loading Spinner"
		// 		data-testid="loader"
		// 	/>
		// );
		// }
	}, [isPlaying]);

	// needed for streaming updates in the messageCard component
	const displayedMessageText = useMemo(() => {
		if (showTranslation && displayedMessage?.translation) {
			return displayedMessage?.translation;
		}

		return displayedMessage?.content;
		// NOTE: displayedMessage?.content must be included in the deps array
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [displayedMessage, displayedMessage?.content, showTranslation]);

	const messageCardInnerContent = useMemo(() => {
		const isShowingTranslation =
			showTranslation &&
			displayedMessage?.translation &&
			(!dictionaryMode || isPlaying);

		if (false) {
			return (
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
			);
		}

		if (dictionaryMode && STATUS === status.IDLE) {
			return (
				<div
					style={{
						direction: isShowingTranslation ? "ltr" : "rtl",
					}}
				>
					<div className="flex flex-wrap gap-2">
						{_.words(
							displayedMessage?.content.replace(nonWordCharactersRegExp, "")
						).map((word, i) => (
							<Badge
								key={`${word}_${i}`}
								variant="secondary"
								className="text-lg cursor-pointer hover:bg-primary hover:text-white"
								onClick={() => setDrawerOpen(true)}
							>
								{word}
							</Badge>
						))}
					</div>
				</div>
			);
		}

		const words = _.words(displayedMessageText);

		if (isPlaying && wordTimestampsRef.current) {
			return (
				<div
					style={{
						direction: isShowingTranslation ? "ltr" : "rtl",
					}}
					className="p-1"
				>
					{words.map((word, ind) => {
						if (
							!wordTimestampsRef.current ||
							wordTimestampsRef.current[ind] === undefined
						) {
							return null;
						}

						const {
							word: timestampedWord,
							startTime,
							endTime,
						} = wordTimestampsRef.current![ind];

						const isLastWord = ind === words.length - 1;

						const currentTimeMoreThanStartTime = currentTime >= startTime;

						const nextWordStarted = isLastWord
							? false
							: currentTime >= wordTimestampsRef.current![ind + 1]?.startTime;

						const isActive = currentTimeMoreThanStartTime && !nextWordStarted;

						return (
							<span
								key={`${word}_${ind}`}
								className={cn(
									isActive && "bg-indigo-600 text-white",
									"rounded-md p-1"
								)}
							>
								{word}{" "}
							</span>
						);
					})}
				</div>
			);
		}

		return (
			<div
				style={{
					direction: isShowingTranslation ? "ltr" : "rtl",
				}}
			>
				{displayedMessageText}
			</div>
		);
	}, [
		STATUS,
		currentTime,
		dictionaryMode,
		displayedMessage,
		displayedMessageText,
		isPlaying,
		showTranslation,
	]);

	const messageCardContent = useMemo(() => {
		if (!displayedMessage) return null;

		return (
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
				content={messageCardInnerContent}
			/>
		);
	}, [
		displayedMessage,
		messageCardDetails.name,
		messageCardDetails.avatarSrc,
		messageCardDetails.avatarAlt,
		STATUS,
		menuContent,
		messageCardInnerContent,
	]);

	const messageIndexContent = useMemo(
		() =>
			displayedMessageText && (
				<div className="text-slate-400 mt-1 w-full flex justify-end px-4 text-sm">
					{(displayedMessageInd ?? 0) + 1} / {messages.length}
				</div>
			),
		[displayedMessageInd, displayedMessageText, messages.length]
	);

	const drawerContent = (
		<Drawer
			open={drawerOpen}
			// open={true}
			onOpenChange={setDrawerOpen}
		>
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

	const recordingBlob = isRecording && (
		<>
			<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0066] opacity-75" />
			<span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF0066]" />
		</>
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
			<div className="absolute top-0 left-0 z-30 w-screen">
				{progressBarContent}
			</div>
			{/* wrapper */}
			<div className="h-full flex flex-col items-center justify-between mx-auto gap-4 px-4 py-4 md:pt-6 md:pb-14">
				<div className="hidden md:block">{panelItemsContent}</div>
				{/* chat bubble and pagination wrapper */}
				<div className="flex-1 min-h-0 basis-0 flex flex-col justify-center items-center w-full h-full max-w-2xl">
					{/* message card container */}
					<div className={cn("min-h-0 w-full max-w-2xl ")}>
						{messageCardContent}
					</div>
					{messageIndexContent}
				</div>
				<div className="relative flex h-4 w-4 my-2">{recordingBlob}</div>
				<div className="h-12 w-full text-center">{instructionContent}</div>
				<div className="md:hidden mb-8">{panelItemsContent}</div>
			</div>
			{drawerContent}
			<SupportCard className="absolute bottom-0 right-0" />
		</div>
	);
};

export default ConversationIdPage;
