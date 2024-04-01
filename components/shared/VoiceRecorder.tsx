import React, { useRef, useState, useEffect } from "react";
import MicrophoneOff from "./icons/MicrophoneOff";
import MicrophoneOn from "./icons/MicrophoneOn";

declare global {
	interface Window {
		webkitSpeechRecognition: any;
	}
}

const VoiceRecorder = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingComplete, setRecordingComplete] = useState(false);
	const [transcript, setTranscript] = useState("");

	const recognitionRef = useRef<any>(null);

	useEffect(() => {
		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, []);

	const startRecording = () => {
		setIsRecording(true);

		recognitionRef.current = new window.webkitSpeechRecognition();
		recognitionRef.current.continuous = true;
		recognitionRef.current.interimResults = true;

		recognitionRef.current.onresult = (event: any) => {
			console.log(event);
			const { transcript } = event.results[event.results.length - 1][0];
			setTranscript(transcript);
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

	return (
		<div className="">
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
						onClick={stopRecording}
						className="rounded-full w-20 h-20 mt-10 m-auto flex items-center justify-center bg-red-400 hover:bg-red-500"
					>
						<MicrophoneOn />
					</button>
				) : (
					<button
						onClick={startRecording}
						className="rounded-full w-20 h-20 mt-10 m-auto flex items-center justify-center bg-blue-400 hover:bg-blue-500"
					>
						<MicrophoneOff />
					</button>
				)}
			</div>
		</div>
	);
};

export default VoiceRecorder;
