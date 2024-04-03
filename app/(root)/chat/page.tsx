"use client";

import React, { useContext, useRef, useState, useCallback } from "react";
import LanguageContext from "@/context/languageContext";
import StopIcon from "@/components/shared/icons/Stop";
import MicrophoneOffIcon from "@/components/shared/icons/MicrophoneOff";
import Image from "next/image";
import Link from "next/link";
import { useOnSilenceDetected } from "@/hooks/useOnSilenceDetected";

const startSound = new Audio("/assets/sounds/start.mp3");
const stopSound = new Audio("/assets/sounds/stop.mp3");

const ChatPage = () => {
	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);
	const [firstRecordingDone, setFirstRecordingDone] = useState(false);
	const [recordingComplete, setRecordingComplete] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	const sendToBackend = useCallback(async (blob: Blob): Promise<void> => {
		console.log("sending to backend - recordingBlob", blob);

		// if (recordingBlob) {
		// 	const blobURL = URL.createObjectURL(recordingBlob);

		// 	const audio = new Audio(blobURL);

		// 	audio.play();

		// 	audio.onended = () => {
		// 		console.log("Audio playback ended.");
		// 	};
		// }

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

	const startRecordingHandler = useCallback(() => {
		startSound.play();

		setRecordingComplete(false);
		setIsRecording(true);

		navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
			mediaRecorderRef.current = new MediaRecorder(stream);
			mediaRecorderRef.current.start();

			mediaRecorderRef.current.ondataavailable = (e) => {
				chunksRef.current.push(e.data);
			};

			mediaRecorderRef.current.onstop = (e) => {
				const blob = new Blob(chunksRef.current, { type: "audio/wav" });
				sendToBackend(blob);
			};
		});
	}, [sendToBackend]);

	const stopRecordingHandler = useCallback(() => {
		if (isRecording) {
			stopSound.play();
			setRecordingComplete(true);
			setIsRecording(false);

			mediaRecorderRef.current?.stop();
		}
	}, [isRecording]);

	const handleToggleRecording = () => {
		if (!isRecording && !isPlaying) {
			startRecordingHandler();
		} else if (isRecording) {
			stopRecordingHandler();
		}
	};

	useOnSilenceDetected(mediaRecorderRef.current, stopRecordingHandler);

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
								{!firstRecordingDone
									? "هيا بِنا"
									: isRecording
									? "Recording"
									: "Recorded"}
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
					{/* 
					{transcript && (
						<div className="border rounded-md p-2 h-full mt-4 ">
							<p className="mb-0">{transcript}</p>
						</div>
					)} */}
				</div>
			}

			<div className="flex items-center w-full">
				{isRecording ? (
					<button
						onClick={handleToggleRecording}
						className="rounded-full w-20 h-20 mt-10 m-auto flex items-center justify-center bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50"
						// className="font-poppins font-medium shadow-lg text-white bg-gradient-to-br from-purple-600 to-blue-500 px-6 py-4 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800  rounded-lg text-sm sm:text-md md:text-lg text-center mt-4 w-full sm:w-auto sm:mt-0"
					>
						<StopIcon style={{ stroke: "ghostWhite" }} />
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
