"use client";

import React, {
	useContext,
	useState,
	useCallback,
	useEffect,
	useRef,
} from "react";
import LanguageContext from "@/context/languageContext";
import { BlobSvg } from "@/components/shared";
import Image from "next/image";
import Link from "next/link";
import { useRecording } from "@/hooks/useRecording";
import { useSound } from "@/hooks/useSound";

// AUDIO FORMATS SUPPORTED ON DESKTOP
// audio/ogg - yes
// audio/mp3 - yes
// audio/aac - yes
// audio/webm - yes
// audio/webm; codecs=opus - yes
// audio/wav - yes
// audio/wave - no
// should fail - no

// AUDIO FORMATS SUPPORTED ON MOBILE
// audio/ogg - no
// audio/mp3 - yes
// audio/aac - yes
// audio/webm - no
// audio/webm; codecs=opus - no
// audio/wav - yes
// audio/wave - yes
// should fail - no

const audioFormats = [
	"audio/ogg",
	"audio/mp3",
	"audio/aac",
	"audio/webm",
	"audio/webm; codecs=opus",
	"audio/wav",
	"audio/wave",
	"should fail",
];

const supportsFormat = (audio: HTMLAudioElement, format: string) =>
	audio.canPlayType(format).length > 0;

const ChatPage = () => {
	const { nativeLanguage, arabicDialect } = useContext(LanguageContext);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [details, setDetails] = useState<
		{ format: string; supported: boolean }[]
	>([]);

	const bell = useSound("/assets/sounds/response.mp3");

	const [playingMessage, setPlayingMessage] = useState("");

	const sendToBackend = useCallback(
		async (blob: Blob): Promise<void> => {
			console.log("sending to backend - recordingBlob", blob);

			setIsLoading(true);

			// wait 3 seconds
			// await new Promise((resolve) => setTimeout(resolve, 1000));

			const blobURL = URL.createObjectURL(blob);
			const userAudio = new Audio(blobURL);

			const details = audioFormats.map((format) => ({
				format,
				supported: supportsFormat(userAudio, format),
			}));
			setDetails(details);

			setIsPlaying(true);
			setPlayingMessage("starting to play response");
			bell?.play();

			userAudio.play();

			userAudio.onended = () => {
				console.log("audio finished playing");
				setPlayingMessage("finished playing response");
				stopPlayingResponse();
			};

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

	const handleToggleRecording = () => {
		if (isPlaying) {
			stopPlayingResponse();
			return;
		}
		if (isRecording) {
			stopRecording();
			return;
		}

		if (!isRecording) {
			setPlayingMessage("");

			startRecording();
			return;
		}
	};

	const stopPlayingResponse = () => {
		setIsPlaying(false);
		setIsLoading(false);
		// if (responseAudioRef.current) {
		// 	responseAudioRef.current.pause();
		// 	responseAudioRef.current.remove();
		// 	responseAudioRef.current.src = "";
		// 	responseAudioRef.current = undefined;
		// }
	};

	return (
		<div className="bg-slate-200 w-full h-screen">
			<p>
				Chat {nativeLanguage} - {arabicDialect}
			</p>
			<p>
				{details.length > 0 && (
					<div>
						{details.map(({ format, supported }) => (
							<div key="format">
								{format} - {supported ? "yes" : "no"}
							</div>
						))}
					</div>
				)}
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
								{isPlaying ? "Playing" : isRecording ? "Recording" : "Recorded"}
							</p>
							<p className="text-sm">
								{isPlaying
									? "playing response"
									: isRecording
									? `listening - amplitude: ${amplitude}`
									: "Press the blue blob to start recording"}
							</p>
							<p>{playingMessage ?? "No playing message"}</p>
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
					className="mt-10 m-auto cursor-pointer"
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
