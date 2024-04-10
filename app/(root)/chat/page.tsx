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
import { base64ToBlob, blobToBase64, cn } from "@/lib/utils";
import { useLogger } from "@/hooks/useLogger";
import CursorSVG from "@/components/shared/CursorSVG";
import _ from "lodash";
import { amiri } from "@/lib/fonts";

const makeServerlessRequest = async (url: string, body: any) => {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	const data = await response.json();

	if (response.status !== 200) {
		throw (
			data.error || new Error(`Request failed with status ${response.status}`)
		);
	}

	return data;
};

const speechToText = async (audioBlob: Blob) => {
	const base64Audio = await blobToBase64(audioBlob);

	const { transcription } = await makeServerlessRequest(
		"/api/chat/speech-to-text",
		{
			audio: {
				base64Audio,
				type: audioBlob.type.split("/")[1],
			},
		}
	);

	return { transcription };
};

const appendUserMessageAndAwaitAssistantResponse = async (
	messages: Message[],
	latestMessage: string
) => {
	const { messages: updatedMessages } = await makeServerlessRequest(
		"/api/chat/assistant",
		{
			messages,
			content: latestMessage,
		}
	);

	return { messages: updatedMessages };
};

const textToSpeech = async (content: string) => {
	const { base64Audio } = await makeServerlessRequest(
		"/api/chat/text-to-speech",
		{
			content,
		}
	);

	return { base64Audio };
};

type Message = { role: "user" | "assistant"; content: string };

const ChatPage = () => {
	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [transformationState, setTransformationState] = useState("");

	const logger = useLogger({ label: "ChatPage", color: "#fe7de9" });

	const sendToBackend = useCallback(
		async (audioBlob: Blob): Promise<void> => {
			setIsLoading(true);

			try {
				setTransformationState("audio -> transcription");
				logger.log("making request to: /api/chat/speech-to-text...");
				// 1. transcribe the user's audio
				const { transcription } = await speechToText(audioBlob);
				logger.log("transcription", transcription);

				setTransformationState("text -> text");
				logger.log("making request to: /api/chat/assistant...");
				// 2. send the transcription to the assistant and await a text response
				const { messages: updatedMessages } =
					await appendUserMessageAndAwaitAssistantResponse(
						messages,
						transcription
					);
				logger.log("updatedMessages", JSON.stringify(updatedMessages));

				const assistantResponseMessage = _.last(updatedMessages) as Message;

				setTransformationState("text -> audio");
				logger.log("making request to: /api/chat/text-to-speech...");
				// 3. convert the text response to audio
				const { base64Audio } = await textToSpeech(
					assistantResponseMessage.content
				);
				logger.log("base64Audio", base64Audio);

				// 4. play the audio and updated the messages in state
				setIsLoading(false);

				updateMessagesAndTypeLatestMessage(updatedMessages);

				await playAudio(base64Audio);

				setIsPlaying(false);
				setTransformationState("");
			} catch (error) {
				logger.error(error);
				logger.log((error as Error).message);
			}
		},
		[messages, logger]
	);

	const { isRecording, startRecording, stopRecording, amplitude } =
		useRecording(sendToBackend);

	const toggleRecording = () => {
		if (isRecording) {
			stopRecording();
			return;
		}

		if (!isRecording) {
			setTransformationState("");
			startRecording();
			return;
		}
	};

	const playAudio = async (base64Audio: string) => {
		const promise = new Promise((resolve, reject) => {
			const audioBlob = base64ToBlob(base64Audio, "audio/mp3");
			const audioSrc = URL.createObjectURL(audioBlob);
			const audio = new Audio(audioSrc);

			setIsPlaying(true);

			audio.play();

			const onAudioEnded = () => {
				URL.revokeObjectURL(audioSrc);
				audio.removeEventListener("ended", onAudioEnded);
				audio.removeEventListener("error", reject);
				resolve(null);
			};

			audio.addEventListener("ended", onAudioEnded);
			audio.addEventListener("error", reject);
		});

		return promise;
	};

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

	const updateMessagesAndTypeLatestMessage = (messages: Message[]) => {
		const mostRecentMessage = _.last(messages) as Message;
		const previousMessages = messages.slice(0, messages.length - 1);

		setCompletedTyping(false);

		let i = 0;

		const intervalId = setInterval(() => {
			setMessages([
				...previousMessages,
				{
					...mostRecentMessage,
					content: mostRecentMessage.content.slice(0, i),
				},
			]);

			i++;

			if (i > mostRecentMessage.content.length) {
				clearInterval(intervalId);
				setCompletedTyping(true);
			}
		}, 25);

		return () => clearInterval(intervalId);
	};

	const displayedMessage = useMemo(() => {
		if (isRecording) return "👂";
		if (isLoading) return "🤔";
		if (isPlaying || !_.isEmpty(messages)) {
			return _.last(messages)?.content ?? "";
		}
		return "Press ⬇️ the blue blob to start recording";
	}, [isLoading, isPlaying, isRecording, messages]);

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
						" leading-loose font-extrabold tracking-tight text-4xl md:text-5xl lg:text-6xl text-center px-5",
						!_.isEmpty(messages) && amiri.className, // when displaying arabic text
						isPlaying && "text-araby-blue", // while playing
						!isPlaying && "text-slate-600",
						(isRecording || isLoading) && "text-5xl" // for emojis
					)}
					// for the cursor to be on the left side of the text
					{...(isPlaying ? { style: { direction: "rtl" } } : {})}
				>
					{displayedMessage} {isPlaying && !completedTyping && <CursorSVG />}
				</p>
				<p className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-max h-[20px] text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 text-center dark:text-gray-400">
					{transformationState}
				</p>
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
