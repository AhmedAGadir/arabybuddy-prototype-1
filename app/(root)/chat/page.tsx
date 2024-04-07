"use client";

import React, { useContext, useState, useCallback } from "react";
import LanguageContext from "@/context/languageContext";
import { BlobSvg } from "@/components/shared";
import Image from "next/image";
import Link from "next/link";
import { useSound } from "@/hooks/useSound";
import { useRecording } from "@/hooks/useRecording/useRecording";
import { BackgroundGradient } from "@/components/ui/background-gradient";

const blobToBase64 = async (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = function () {
			const base64data = (reader?.result as string).split(",")[1];
			resolve(base64data);
		};
		reader.onerror = reject; // Handle errors
		reader.readAsDataURL(blob);
	});
};

const ChatPage = () => {
	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);
	const [isPlaying, setIsPlaying] = useState(false);
	const [playingMessage, setPlayingMessage] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const bell = useSound("/assets/sounds/response.mp3");

	const [result, setResult] = useState<string | null>(null);

	const sendToBackend = useCallback(
		async (audioBlob: Blob): Promise<void> => {
			console.log("sending to backend - audioBlob", audioBlob);

			setIsLoading(true);

			try {
				const base64Audio = await blobToBase64(audioBlob);

				console.log({
					type: audioBlob.type.split("/")[1],
					base64Audio,
				});

				const response = await fetch("/api/chat/speech-to-text", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						base64Audio,
						type: audioBlob.type.split("/")[1],
					}),
				});

				const data = await response.json();

				if (response.status !== 200) {
					throw (
						data.error ||
						new Error(`Request failed with status ${response.status}`)
					);
				}

				setResult(data.result);
			} catch (error) {
				console.error(error);
				console.log((error as Error).message);
			}

			// setIsPlaying(true);
			// setPlayingMessage("starting to play response");
			// bell?.play();

			// const blobURL = URL.createObjectURL(blob);
			// const userAudio = new Audio(blobURL);
			// userAudio.play();

			// userAudio.onended = () => {
			// 	console.log("audio finished playing");
			// 	setPlayingMessage("finished playing response");
			// 	stopPlayingResponse();
			// };

			// try {
			// 	stopRecording();

			// 	const response = await fetch("/api/chat", {
			// 		method: "POST",
			// 		headers: { "Content-Type": "application/json" },
			// 		body: JSON.stringify({ recordingBlog, nativeLanguage, arabicDialect }),
			// 	});

			// 	if (!response.ok)
			// 		throw new Error(`HTTP error! status: ${response.status}`);

			// 	const data = await response.json();
			// 	if (data.data && data.contentType === "audio/mp3") {
			// 		const audioSrc = `data:audio/mp3;base64,${data.data}`;
			// 		const audio = new Audio(audioSrc);
			// 		setIsPlaying(true);
			// 		audio.play();
			// 		audio.onended = () => {
			// 			setIsPlaying(false);
			// 			startRecording();
			// 		};
			// 	}
			// } catch (error) {
			// 	console.error("Error sending data to backend or playing audio:", error);
			// }
			// setIsLoading(false);
		},
		[bell]
	);

	const { isRecording, startRecording, stopRecording, amplitude } =
		useRecording(sendToBackend);

	const stopPlayingResponse = () => {
		setIsPlaying(false);
		setIsLoading(false);
	};

	const toggleRecording = () => {
		setPlayingMessage("");
		stopPlayingResponse();

		if (isRecording) {
			stopRecording();
			return;
		}

		if (!isRecording) {
			startRecording();
			return;
		}
	};

	return (
		<div className="bg-slate-200 w-full h-screen">
			<p>
				Chat {nativeLanguage} - {arabicDialect}
			</p>

			<Link href="/">
				<div className="rounded-md p-2 bg-white w-fit ">
					<Image
						src="/assets/arabybuddy.svg"
						alt="logo"
						width={50}
						height={50}
					/>
				</div>
			</Link>

			{
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
								<p className="text-sm">
									{isPlaying
										? "playing response"
										: isRecording
										? `listening - amplitude: ${amplitude}`
										: "Press the blue blob to start recording"}
								</p>
							</div>

							{isRecording && (
								<div className="rounded-full w-4 h-4 bg-red-400 animate-pulse" />
							)}
							{/*
					{transcript && (
						<div className="border rounded-md p-2 h-full mt-4 ">
							<p className="mb-0">{transcript}</p>
						</div>
					)} */}
						</div>
					</BackgroundGradient>
				</div>
			}

			{result && (
				<div className="w-2/3 md:w-1/2 m-auto my-4">
					<BackgroundGradient
						className="rounded-[22px] p-4 bg-white"
						animate={false}
					>
						{result}
					</BackgroundGradient>
				</div>
			)}

			<div className="flex items-center w-full">
				<button
					className="mt-10 m-auto cursor-pointer"
					onClick={toggleRecording}
				>
					<BlobSvg
						size={amplitude ? 200 + amplitude * 2 : 200}
						fill={isPlaying ? "#5E17EB" : isRecording ? "#FF0066" : "#38B6FF"}
					/>
				</button>
			</div>
		</div>
	);
};

export default ChatPage;
