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

import { useToast } from "@/components/ui/use-toast";

import { Progress } from "@/components/ui/progress";

import MessageCard from "@/components/shared/MessageCard";

import PulseLoader from "react-spinners/PulseLoader";
import SkewLoader from "react-spinners/SkewLoader";
import ScaleLoader from "react-spinners/ScaleLoader";
import { ToastAction } from "@radix-ui/react-toast";

import { IMessage } from "@/lib/database/models/message.model";
import { useUser } from "@clerk/nextjs";

import SupportCard from "@/components/shared/SupportCard";

import _ from "lodash";
import { Transition } from "@headlessui/react";

import { cn } from "@/lib/utils";
import { cairo } from "@/lib/fonts";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCyclingText } from "@/hooks/useCyclingText";
import { DictionaryDrawer } from "@/components/shared/DictionaryDrawer";
import ChatPanel from "@/components/shared/ChatPanel";
import { status, type Status } from "@/types/types";
import { chatPartners } from "@/lib/chatPartners";
const { ObjectId } = require("bson");

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

// try to keep business logic out of this page as its a presentation/view component
const ConversationIdPage = ({
	params: { conversationId },
}: {
	params: { conversationId: string };
}) => {
	const logger = useLogger({ label: "ConversationIdPage", color: "#fe7de9" });

	const { toast, dismiss } = useToast();

	const { user } = useUser();

	const { conversations, updateConversation, deleteConversation } =
		useConversations();

	const conversation = conversations.find((c) => c._id === conversationId);

	const chatPartnerId = conversation?.chatPartnerId;

	const chatPartner = chatPartners.find((p) => p.id === chatPartnerId);

	const chatDialect = conversation?.chatDialect;

	const {
		isPending,
		error,
		messages,
		createMessage,
		updateMessage,
		deleteMessages,
		refetch,
		upsertMessageInCache,
		isLoading,
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

	const isNewChat = searchParams.get("new") === "true";

	const updateQueryStr = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set(name, value);

			router.replace(pathname + "?" + params.toString());
		},
		[pathname, router, searchParams]
	);

	const updateDisplayedMessageInd = useCallback(
		(newIndex: number) => {
			updateQueryStr("ind", newIndex.toString());
		},
		[updateQueryStr]
	);

	const previousMessageHandler = () =>
		updateDisplayedMessageInd((displayedMessageInd ?? 0) - 1);

	const nextMessageHandler = () =>
		updateDisplayedMessageInd((displayedMessageInd ?? 0) + 1);

	if (searchParams.get("ind") === null && messages.length > 0) {
		logger.log("init displayedMessageInd to last message index");
		updateDisplayedMessageInd(messages.length - 1);
	}

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

	const [progressBarValue, setProgressBarValue] = useState(0);

	const progressBarIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const startProgressBarInterval = useCallback(() => {
		progressBarIntervalRef.current = setInterval(() => {
			setProgressBarValue((prev) => {
				if (prev >= 100) {
					return prev;
				}
				return prev + 1;
			});
		}, 30);
	}, []);

	const stopProgressBar = useCallback(() => {
		if (progressBarIntervalRef.current) {
			clearInterval(progressBarIntervalRef.current);
		}
		setProgressBarValue(0);
	}, []);

	const STATUS: Status = useMemo(() => {
		if (isRecording) return status.RECORDING;
		if (isPlaying) return status.PLAYING;
		if (activeTask !== null) return status.PROCESSING;
		return status.IDLE;
	}, [activeTask, isPlaying, isRecording]);

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
				...(activeTask === "SPEECH_TO_TEXT" ? ["Transcribing..."] : []),
				...(activeTask === "ASSISTANT" ? ["Generating a response..."] : []),
				...(activeTask === "TEXT_TO_SPEECH" ? ["Preparing audio..."] : []),
				...(activeTask === "TEXT_TO_SPEECH_REPLAY"
					? ["Regenerating audio..."]
					: []),
				...(activeTask === "ASSISTANT_REGENERATE"
					? ["Regenerating response..."]
					: []),
				...(activeTask === "ASSISTANT_REPHRASE"
					? ["Rephrasing your message to make it sound more natural..."]
					: []),
				...(activeTask === "ASSISTANT_TRANSLATE"
					? ["Translating your message..."]
					: []),
			],
		}),
		[activeTask, messages.length]
	);

	const {
		text: instruction,
		showText: showInstruction,
		hideText: hideInstruction,
	} = useCyclingText(instructions[STATUS]);

	const abortProcessingBtnHandler = useCallback(() => {
		if (STATUS !== status.PROCESSING) return;
		switch (activeTask) {
			case "SPEECH_TO_TEXT":
				abortSpeechToText();
				break;
			case "TEXT_TO_SPEECH":
			case "TEXT_TO_SPEECH_REPLAY":
				abortTextToSpeech();
				break;
			case "ASSISTANT":
			case "ASSISTANT_REGENERATE":
			case "ASSISTANT_REPHRASE":
			case "ASSISTANT_TRANSLATE":
				abortMakeChatCompletionStream();
				break;
			default:
				break;
		}
	}, [
		STATUS,
		abortMakeChatCompletionStream,
		abortSpeechToText,
		abortTextToSpeech,
		activeTask,
	]);

	useEffect(() => {
		return () => {
			// abortProcessingBtnHandler();
		};
	}, [abortProcessingBtnHandler]);

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
			stopProgressBar();
		},
		[isPlaying, stopPlaying, stopProgressBar, toast]
	);

	// const generateGreeting = useCallback(async () => {
	// 	try {
	// 		if (!chatPartnerId || !chatDialect) {
	// 			throw new Error("chatPartnerId or chatDialect is null");
	// 		}

	// 		startProgressBarInterval();

	// 		setActiveTask("ASSISTANT");

	// 		const completionStream = await makeChatCompletionStream([], {
	// 			chatPartnerId,
	// 			chatDialect,
	// 		});

	// 		const dateStr = new Date().toISOString();

	// 		const completionMessage = {
	// 			// this id will be replaced by the actual id from the database
	// 			_id: new ObjectId().toHexString(),
	// 			clerkId: user!.id,
	// 			conversationId,
	// 			createdAt: dateStr,
	// 			updatedAt: dateStr,
	// 			role: "assistant",
	// 			content: "",
	// 		} as IMessage;

	// 		updateDisplayedMessageInd(0);

	// 		for await (const data of completionStream) {
	// 			completionMessage.content = data.content;
	// 			completionMessage.role = data.role;
	// 			await upsertMessageInCache(completionMessage);
	// 		}

	// 		setActiveTask("TEXT_TO_SPEECH");

	// 		const { base64Audio, wordData } = await textToSpeech(
	// 			completionMessage.content,
	// 			{
	// 				chatPartnerId,
	// 				chatDialect,
	// 			}
	// 		);

	// 		if (!audioElementInitialized) {
	// 			initAudioElement();
	// 		}
	// 		await playAudio(base64Audio);

	// 		setActiveTask(null);

	// 		await createMessage({
	// 			role: completionMessage.role,
	// 			content: completionMessage.content,
	// 		});

	// 		updateConversation({
	// 			_id: conversationId,
	// 			lastMessage: completionMessage.content,
	// 		});

	// 		stopProgressBar();

	// 		return { success: true };
	// 	} catch (error) {
	// 		logger.error("generateGreeting failed", error);

	// 		handleError(error);

	// 		return { success: false };
	// 	}
	// }, [
	// 	audioElementInitialized,
	// 	chatDialect,
	// 	chatPartnerId,
	// 	conversationId,
	// 	createMessage,
	// 	handleError,
	// 	initAudioElement,
	// 	logger,
	// 	makeChatCompletionStream,
	// 	playAudio,
	// 	startProgressBarInterval,
	// 	stopProgressBar,
	// 	textToSpeech,
	// 	updateConversation,
	// 	updateDisplayedMessageInd,
	// 	upsertMessageInCache,
	// 	user,
	// ]);

	// const greetingGeneratedRef = useRef(false);

	// if (
	// 	!greetingGeneratedRef.current &&
	// 	isNewChat &&
	// 	!isPending &&
	// 	messages.length === 0 &&
	// 	chatPartnerId &&
	// 	user?.id
	// ) {
	// 	// generateGreeting();
	// 	greetingGeneratedRef.current = true;
	// }

	const onRecordingComplete = useCallback(
		async (audioBlob: Blob) => {
			// await new Promise((resolve) => setTimeout(resolve, 3000));
			// throw new Error("Not implemented");
			try {
				if (!chatPartnerId || !chatDialect) {
					throw new Error("chatPartnerId or chatDialect is null");
				}

				// sanitize audio blob - it cant be larger than 9.216 MB
				if (audioBlob.size > 9216000) {
					throw new Error("Audio is too long");
				}

				startProgressBarInterval();

				// TODO: sanitize transcription, no input should be empty
				setActiveTask("SPEECH_TO_TEXT");

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
					wordMetadata: [],
				});

				setActiveTask("ASSISTANT");

				const completionStream = await makeChatCompletionStream(
					[
						...messageHistory,
						{
							role: "user",
							content: transcription,
						},
					],
					{
						chatPartnerId,
						chatDialect,
					}
				);

				const dateStr = new Date().toISOString();

				const ObjectId1 = ObjectId;
				debugger;

				const completionMessage: IMessage = {
					// this id will be replaced by the actual id from the database
					_id: new ObjectId().toHexString(),
					clerkId: user!.id,
					conversationId,
					createdAt: dateStr,
					updatedAt: dateStr,
					role: "assistant",
					content: "",
					wordMetadata: [],
				};

				latestMessageInd++;
				updateDisplayedMessageInd(latestMessageInd);

				for await (const data of completionStream) {
					completionMessage.content = data.content;
					completionMessage.role = data.role;
					await upsertMessageInCache(completionMessage);
				}

				setActiveTask("TEXT_TO_SPEECH");

				const { base64Audio, wordData } = await textToSpeech(
					completionMessage.content,
					{
						chatPartnerId,
						chatDialect,
					}
				);

				console.log("worddata", wordData);

				setActiveTask("ASSISTANT_TRANSLATE");

				const wordMetadataCompletionStream = await makeChatCompletionStream(
					[
						{
							role: "assistant",
							content: JSON.stringify(
								wordData.map(({ _id, word }) => ({ _id, arabic: word }))
							),
						},
					],
					{
						mode: "TRANSLATE",
						chatPartnerId,
						chatDialect,
					}
				);

				let wordMetadataCompletion = "";
				for await (const data of wordMetadataCompletionStream) {
					wordMetadataCompletion = data.content;
				}

				const wordMetadataCompletionArr = JSON.parse(
					wordMetadataCompletion
				) as { _id: string; arabic: string; english: string }[];

				if (
					!Array.isArray(wordMetadataCompletionArr) ||
					wordMetadataCompletionArr.length !== wordData.length
				) {
					throw new Error(
						"Word metadata completion stream did not return the expected data"
					);
				}

				completionMessage.wordMetadata = wordMetadataCompletionArr.map(
					({ _id, arabic, english }, ind) => {
						const wordInd = wordData.findIndex((word) => word._id === _id);

						return {
							_id,
							arabic,
							english,
							startTime:
								wordInd !== -1
									? wordData[wordInd].startTime
									: wordData[ind].startTime,
							endTime:
								wordInd !== -1
									? wordData[wordInd].endTime
									: wordData[ind].endTime,
						};
					}
				);

				console.log("completionMessage", completionMessage);

				await upsertMessageInCache(completionMessage);

				setActiveTask(null);

				if (!audioElementInitialized) {
					initAudioElement();
				}
				await playAudio(base64Audio);

				await createMessage({
					role: completionMessage.role,
					content: completionMessage.content,
					wordMetadata: completionMessage.wordMetadata,
				});

				updateConversation({
					_id: conversationId,
					lastMessage: completionMessage.content,
				});

				stopProgressBar();

				return { success: true };
			} catch (error) {
				logger.error("onRecordingComplete failed", error);

				handleError(error);

				return { success: false };
			}
		},
		[
			chatPartnerId,
			chatDialect,
			startProgressBarInterval,
			speechToText,
			messages,
			updateDisplayedMessageInd,
			createMessage,
			makeChatCompletionStream,
			user,
			conversationId,
			textToSpeech,
			audioElementInitialized,
			playAudio,
			updateConversation,
			stopProgressBar,
			upsertMessageInCache,
			initAudioElement,
			logger,
			handleError,
		]
	);

	const replayBtnHandler = useCallback(async () => {
		try {
			if (!chatPartnerId || !chatDialect) {
				throw new Error("chatPartnerId or chatDialect is null");
			}

			if (!displayedMessage) {
				throw new Error("displayedMessage is null");
			}

			startProgressBarInterval();

			setActiveTask("TEXT_TO_SPEECH_REPLAY");

			const { base64Audio, wordData } = await textToSpeech(
				displayedMessage.content,
				{
					chatPartnerId,
					chatDialect,
				}
			);

			setActiveTask(null);

			if (!audioElementInitialized) {
				initAudioElement();
			}
			await playAudio(base64Audio);

			stopProgressBar();
		} catch (error) {
			logger.error("replayBtnHandler", error);
			handleError(error, "There was a problem replaying this message");
		}
	}, [
		audioElementInitialized,
		chatDialect,
		chatPartnerId,
		displayedMessage,
		handleError,
		initAudioElement,
		logger,
		playAudio,
		startProgressBarInterval,
		stopProgressBar,
		textToSpeech,
	]);

	const stopPlayingHandler = useCallback(() => {
		if (isPlaying) {
			stopPlaying();
		}
	}, [isPlaying, stopPlaying]);

	const redoCompletionHandler = useCallback(
		async (options: { mode: "REGENERATE" | "REPHRASE" }) => {
			try {
				if (!chatPartnerId || !chatDialect) {
					throw new Error("chatPartnerId or chatDialect is null");
				}

				if (!displayedMessage) {
					throw new Error("displayedMessage is null");
				}

				startProgressBarInterval();

				const messageHistory = messages
					.map(({ role, content }) => ({
						role,
						content,
					}))
					.slice(0, displayedMessageInd ?? 0);

				setActiveTask(
					options.mode === "REGENERATE"
						? "ASSISTANT_REGENERATE"
						: "ASSISTANT_REPHRASE"
				);

				const completionStream = await makeChatCompletionStream(
					[
						...messageHistory,
						{
							role: displayedMessage.role,
							content: displayedMessage.content,
						},
					],
					{
						mode: options.mode,
						chatPartnerId,
						chatDialect,
					}
				);

				const completionMessage = {
					_id: displayedMessage._id,
					clerkId: displayedMessage.clerkId,
					conversationId: displayedMessage.conversationId,
					createdAt: displayedMessage.createdAt,
					updatedAt: new Date().toISOString(),
					role: displayedMessage.role,
					content: "",
				} as IMessage;

				for await (const data of completionStream) {
					completionMessage.content = data.content;
					await upsertMessageInCache(completionMessage);
				}

				setActiveTask("TEXT_TO_SPEECH");

				const { base64Audio, wordData } = await textToSpeech(
					completionMessage.content,
					{
						chatPartnerId,
						chatDialect,
					}
				);

				if (!audioElementInitialized) {
					initAudioElement();
				}
				await playAudio(base64Audio);

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

				stopProgressBar();
			} catch (error) {
				logger.error("redoCompletion", error);

				handleError(
					error,
					`There was a problem ${
						options.mode === "REGENERATE" ? "regenerating" : "rephrasing"
					} this message`
				);
			}
		},
		[
			audioElementInitialized,
			chatDialect,
			chatPartnerId,
			conversationId,
			displayedMessage,
			displayedMessageInd,
			handleError,
			initAudioElement,
			logger,
			makeChatCompletionStream,
			messages,
			playAudio,
			startProgressBarInterval,
			stopProgressBar,
			textToSpeech,
			updateConversation,
			updateMessage,
			upsertMessageInCache,
		]
	);

	const [translationMode, setTranslationMode] = useState(false);

	const toggleTranslationHandler = () => {
		setTranslationMode((prev) => !prev);
	};

	const [drawerOpen, setDrawerOpen] = useState(false);

	const [dictionaryMode, setDictionaryMode] = useState(false);

	const toggleDictionaryHandler = () => {
		setDictionaryMode((prev) => !prev);
	};

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

	const chatPanelContent = (
		<ChatPanel
			chatStatus={STATUS}
			previousMessageHandler={previousMessageHandler}
			nextMessageHandler={nextMessageHandler}
			isFirstMessage={displayedMessageInd === 0}
			isLastMessage={displayedMessageInd === messages.length - 1}
			isMessage={displayedMessage !== null}
			isUserMessage={displayedMessage?.role === "user"}
			isAssistantMessage={displayedMessage?.role === "assistant"}
			replayBtnHandler={replayBtnHandler}
			abortProcessingBtnHandler={abortProcessingBtnHandler}
			stopPlayingHandler={stopPlayingHandler}
			redoCompletionHandler={redoCompletionHandler}
			toggleRecordingHandler={toggleRecordingHandler}
			toggleDictionaryHandler={toggleDictionaryHandler}
			toggleTranslationHandler={toggleTranslationHandler}
			dictionaryMode={dictionaryMode}
			translationMode={translationMode}
		/>
	);

	const messageCardContent = displayedMessage && chatPartner && chatDialect && (
		<MessageCard
			message={displayedMessage}
			assistant={chatPartner}
			dialect={chatDialect}
			isPlaying={isPlaying}
			currentTime={currentTime}
			dictionaryMode={dictionaryMode && STATUS === status.IDLE}
			translationMode={translationMode}
			onDictionaryWordClicked={(id: string) => {
				// using the index instead of the id allows us to use pagination in the drawer
				updateQueryStr("wordId", id);
				setDrawerOpen(true);
			}}
			showLoadingOverlay={STATUS === status.PROCESSING}
			// isLoading is only true for the first fetch
			showSkeleton={isLoading}
		/>
	);

	const messageIndexContent = displayedMessage &&
		chatPartner &&
		chatDialect && (
			<div className="text-slate-400 mt-1 w-full flex justify-end px-4 text-sm">
				{(displayedMessageInd ?? 0) + 1} / {messages.length}
			</div>
		);

	const progressBarContent = (
		<Progress
			className="rounded-none h-1"
			// innerClassName="bg-gradient-to-r to-araby-purple from-araby-purple"
			innerClassName="bg-araby-blue"
			value={progressBarValue}
		/>
	);

	const recordingIndicator = (
		<div
			className={cn(
				"relative flex h-4 w-4 my-2",
				// if were not recording, hide the blob on mobile (to save space)
				!isRecording && "hidden md:flex"
			)}
		>
			{isRecording && (
				<>
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0066] opacity-75" />
					<span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF0066]" />
				</>
			)}
		</div>
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

	// if (isPending) {
	// 	return (
	// 		<div className="flex-1 flex items-center justify-center background-texture">
	// 			<SkewLoader
	// 				color="black"
	// 				loading
	// 				size={20}
	// 				aria-label="Loading Spinner"
	// 				data-testid="loader"
	// 			/>
	// 		</div>
	// 	);
	// }

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
				<div className="hidden md:block">{chatPanelContent}</div>
				{/* chat bubble and pagination wrapper */}
				<div className="flex-1 min-h-0 basis-0 flex flex-col justify-center items-center w-full h-full max-w-2xl">
					{/* message card container */}
					<div className={cn("min-h-0 w-full max-w-2xl ")}>
						{messageCardContent}
					</div>
					{messageIndexContent}
				</div>
				{recordingIndicator}
				<div className="h-12 w-full text-center">{instructionContent}</div>
				<div className="md:hidden mb-8">{chatPanelContent}</div>
			</div>
			<DictionaryDrawer
				open={drawerOpen}
				setOpen={setDrawerOpen}
				wordData={
					displayedMessage?.wordMetadata.map(({ _id, arabic }) => ({
						_id,
						word: arabic,
					})) ?? []
				}
				chatPartnerId={chatPartnerId}
				chatDialect={chatDialect}
			/>
			<SupportCard className="fixed bottom-0 right-0" />
		</div>
	);

	{
		/* divs to view each size */
		/* <div className="sm:hidden">
					<h1>xs</h1>
				</div>
				<div className="hidden sm:block md:hidden">
					<h1>small</h1>
				</div>
				<div className="hidden md:block lg:hidden">
					<h1>medium</h1>
				</div>
				<div className="hidden lg:block xl:hidden">
					<h1>large</h1>
				</div>
				<div className="hidden xl:block">
					<h1>xl + up</h1>
				</div> */
	}
};

export default ConversationIdPage;
