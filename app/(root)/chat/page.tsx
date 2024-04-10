"use client";

import React, { useContext, useState, useCallback, useMemo } from "react";
import LanguageContext from "@/context/languageContext";
import { BlobSvg } from "@/components/shared";
import { useRecording } from "@/hooks/useRecording/useRecording";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { base64ToBlob, blobToBase64, cn } from "@/lib/utils";

const ChatPage = () => {
	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [messages, setMessages] = useState<
		{ role: "user" | "assistant"; content: string }[]
	>([]);

	const sendToBackend = useCallback(
		async (audioBlob: Blob): Promise<void> => {
			setIsLoading(true);

			try {
				const base64Audio = await blobToBase64(audioBlob);

				console.log({
					type: audioBlob.type.split("/")[1],
					base64Audio,
				});

				console.log("sending this data", {
					audio: {
						base64Audio,
						type: audioBlob.type.split("/")[1],
					},
					messages,
				});

				const response = await fetch("/api/chat", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						audio: {
							base64Audio,
							type: audioBlob.type.split("/")[1],
						},
						messages,
					}),
				});

				const data = await response.json();

				if (response.status !== 200) {
					throw (
						data.error ||
						new Error(`Request failed with status ${response.status}`)
					);
				}

				console.log("data", data);

				const {
					messages: updatedMessages,
					// audioBase64
				} = data;

				// const responseAudioBlob = base64ToBlob(audioBase64, "audio/mp3");

				setMessages(updatedMessages);

				// const audioSrc = URL.createObjectURL(responseAudioBlob);
				// const audio = new Audio(audioSrc);
				// setIsLoading(false);
				// setIsPlaying(true);
				// audio.play();
				// audio.addEventListener("ended", () => {
				// 	setIsPlaying(false);

				// 	// cleanup
				// 	URL.revokeObjectURL(audioSrc);
				// 	audio.remove();
				// });
			} catch (error) {
				console.error(error);
				console.log((error as Error).message);
			}
		},
		[messages]
	);

	const { isRecording, startRecording, stopRecording, amplitude } =
		useRecording(sendToBackend);

	const toggleRecording = () => {
		if (isRecording) {
			stopRecording();
			return;
		}

		if (!isRecording) {
			startRecording();
			return;
		}
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

	const displayedMessage = useMemo(() => {
		if (isRecording) return "👂";
		if (isLoading) return "🤔";
		if (isPlaying || messages.length > 0) {
			debugger;
			return messages[messages.length - 1].content;
		}
		return "Press ⬇️ the blue blob to start recording";
	}, [isLoading, isPlaying, isRecording, messages]);

	return (
		<div className="w-full h-screen flex flex-col items-center justify-between">
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
			<div className="max-w-4xl m-auto">
				<p
					className={cn(
						"leading-loose font-extrabold tracking-tight text-4xl md:text-5xl lg:text-6xl text-center px-5",
						isPlaying && "text-araby-blue",
						!isPlaying && "text-slate-900",
						(isRecording || isLoading) && "text-5xl"
					)}
				>
					{displayedMessage}
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
