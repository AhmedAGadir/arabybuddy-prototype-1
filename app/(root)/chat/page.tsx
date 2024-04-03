"use client";

import React, { useContext, useState, useCallback } from "react";
import LanguageContext from "@/context/languageContext";
import { MicrophoneOff, Stop } from "@/components/shared/icons";
import { BlobSvg } from "@/components/shared";
import Image from "next/image";
import Link from "next/link";
import { useRecording } from "@/hooks/useRecording";

const ChatPage = () => {
	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const sendToBackend = useCallback(async (blob: Blob): Promise<void> => {
		console.log("sending to backend - recordingBlob", blob);

		const blobURL = URL.createObjectURL(blob);

		const userAudio = new Audio(blobURL);

		userAudio.play();

		userAudio.onended = () => {
			console.log("Audio playback ended.");
		};

		setIsLoading(true);

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
	}, []);

	const { isRecording, startRecording, stopRecording, amplitude } =
		useRecording(sendToBackend);

	const handleToggleRecording = () => {
		if (!isRecording && !isPlaying) {
			startRecording();
		} else if (isRecording) {
			stopRecording();
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
				<div className="w-2/3 md:w-1/2 m-auto rounded-md border p-4 bg-white">
					<div className="flex-1 flex w-full justify-between">
						<div className="space-y-1">
							<p className="text-sm font-medium leading-none">
								{isRecording ? "Recording" : "Recorded"}
							</p>
							<p className="text-sm">
								{isRecording ? `amplitude: ${amplitude}` : "Start speaking..."}
							</p>
						</div>

						{isRecording && (
							<div className="rounded-full w-4 h-4 bg-red-400 animate-pulse" />
						)}
					</div>
					{/* 
					{transcript && (
						<div className="border rounded-md p-2 h-full mt-4 ">
							<p className="mb-0">{transcript}</p>
						</div>
					)} */}
				</div>
			}

			<div className="flex items-center w-full">
				<button
					onClick={handleToggleRecording}
					className="mt-10 m-auto"
					// className="font-poppins font-medium shadow-lg text-white bg-gradient-to-br from-purple-600 to-blue-500 px-6 py-4 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800  rounded-lg text-sm sm:text-md md:text-lg text-center mt-4 w-full sm:w-auto sm:mt-0"
				>
					<BlobSvg amplitude={amplitude} />
				</button>
				{/* {isRecording ? (
					<button
						onClick={handleToggleRecording}
						className="rounded-full w-20 h-20 mt-10 m-auto flex items-center justify-center bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50"
						// className="font-poppins font-medium shadow-lg text-white bg-gradient-to-br from-purple-600 to-blue-500 px-6 py-4 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800  rounded-lg text-sm sm:text-md md:text-lg text-center mt-4 w-full sm:w-auto sm:mt-0"
					>
						<BlobSvg amplitude={amplitude} />
					</button>
				) : (
					<button
						onClick={handleToggleRecording}
						className="rounded-full w-20 h-20 mt-10 m-auto flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/50"
					>
						<MicrophoneOff style={{ stroke: "ghostWhite" }} />
					</button>
				)} */}
			</div>
		</div>
	);
};

export default ChatPage;
