"use client";

import React, { useContext, useRef, useState, useEffect } from "react";
import LanguageContext from "@/context/languageContext";
import MicrophoneOffIcon from "@/components/shared/icons/MicrophoneOff";
import MicrophoneOnIcon from "@/components/shared/icons/MicrophoneOn";
import Image from "next/image";
import Link from "next/link";

declare global {
	interface Window {
		webkitSpeechRecognition: any;
	}
}

const ChatPage = () => {
	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);
	const [isRecording, setIsRecording] = useState(false);
	const [recordingComplete, setRecordingComplete] = useState(false);
	const [transcript, setTranscript] = useState("");

	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const recognitionRef = useRef<any>(null);
	const silenceTimerRef = useRef<any>(null);

	const sendToBackend = async (message: string): Promise<void> => {
		setIsLoading(true);

		try {
			stopRecording();

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message, nativeLanguage, arabicDialect }),
			});

			if (!response.ok)
				throw new Error(`HTTP error! status: ${response.status}`);

			const data = await response.json();
			if (data.data && data.contentType === "audio/mp3") {
				const audioSrc = `data:audio/mp3;base64,${data.data}`;
				const audio = new Audio(audioSrc);
				setIsPlaying(true);
				audio.play();
				audio.onended = () => {
					setIsPlaying(false);
					startRecording();
				};
			}
		} catch (error) {
			console.error("Error sending data to backend or playing audio:", error);
		}
		setIsLoading(false);
	};

	const handleResult = (event: any) => {
		if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
		let interimTranscript = "";
		for (let i = event.resultIndex; i < event.results.length; ++i) {
			interimTranscript += event.results[i][0].transcript;
		}

		setTranscript(interimTranscript);

		silenceTimerRef.current = setTimeout(() => {
			sendToBackend(interimTranscript);
			setTranscript("");
		}, 2000);
	};

	const startRecording = () => {
		setIsRecording(true);

		recognitionRef.current = new window.webkitSpeechRecognition();
		recognitionRef.current.continuous = true;
		recognitionRef.current.interimResults = true;

		recognitionRef.current.onresult = handleResult;
		recognitionRef.current.onend = () => {
			setIsRecording(false);
			if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
		};

		recognitionRef.current.start();
	};

	const stopRecording = () => {
		setIsRecording(false);
		if (recognitionRef.current) {
			recognitionRef.current.stop();
			setRecordingComplete(true);
		}
	};

	const handleToggleRecording = () => {
		if (!isRecording && !isPlaying) startRecording();
		else if (isRecording) stopRecording();
	};

	useEffect(() => {
		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, []);

	return (
		<div className="bg-slate-200 w-full h-screen">
			<p>
				Chat {nativeLanguage} - {arabicDialect}
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
			</p>
			{(isRecording || transcript) && (
				<div className="w-2/3 md:w-1/2 m-auto rounded-md border p-4 bg-white">
					<div className="flex-1 flex w-full justify-between">
						<div className="space-y-1">
							<p className="text-sm font-medium leading-none">
								{recordingComplete ? "Recorded" : "Recording"}
							</p>
							<p className="text-sm">
								{recordingComplete
									? "Thanks for talking."
									: "Start speaking..."}
							</p>
						</div>

						{isRecording && (
							<div className="rounded-full w-4 h-4 bg-red-400 animate-pulse" />
						)}
					</div>

					{transcript && (
						<div className="border rounded-md p-2 h-full mt-4 ">
							<p className="mb-0">{transcript}</p>
						</div>
					)}
				</div>
			)}

			<div className="flex items-center w-full">
				{isRecording ? (
					<button
						onClick={handleToggleRecording}
						className="rounded-full w-20 h-20 mt-10 m-auto flex items-center justify-center bg-red-400 hover:bg-red-500"
						// className="font-poppins font-medium shadow-lg text-white bg-gradient-to-br from-purple-600 to-blue-500 px-6 py-4 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800  rounded-lg text-sm sm:text-md md:text-lg text-center mt-4 w-full sm:w-auto sm:mt-0"
					>
						<MicrophoneOnIcon style={{ stroke: "ghostWhite" }} />
					</button>
				) : (
					<button
						onClick={handleToggleRecording}
						className="rounded-full w-20 h-20 mt-10 m-auto flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/50"
					>
						<MicrophoneOffIcon style={{ stroke: "ghostWhite" }} />
					</button>
				)}
			</div>
		</div>
	);
};

export default ChatPage;
