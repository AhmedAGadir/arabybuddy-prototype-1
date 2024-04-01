// import { useEffect, useState } from "react";

// const VoiceRecognition = () => {
// 	const [recognition, setRecognition] = useState(null);
// 	const [isListening, setIsListening] = useState(false);

// 	useEffect(() => {
// 		if ("webkitSpeechRecognition" in window) {
// 			const SpeechRecognition = window.webkitSpeechRecognition;
// 			const recognition = new SpeechRecognition();
// 			recognition.continuous = true;
// 			recognition.interimResults = true;
// 			setRecognition(recognition);
// 		}
// 	}, []);

// 	const startListening = () => {
// 		if (recognition) {
// 			recognition.start();
// 			setIsListening(true);
// 			recognition.onresult = (event) => {
// 				const transcript = Array.from(event.results)
// 					.map((result) => result[0])
// 					.map((result) => result.transcript)
// 					.join("");
// 				console.log(transcript);
// 				// Here you can handle the transcript, e.g., send it to your chat service
// 			};
// 			recognition.onend = () => {
// 				setIsListening(false);
// 				// Handle the end of the recognition session
// 			};
// 		}
// 	};

// 	const stopListening = () => {
// 		if (recognition) {
// 			recognition.stop();
// 			setIsListening(false);
// 		}
// 	};

// 	return (
// 		<div>
// 			<button onClick={isListening ? stopListening : startListening}>
// 				{isListening ? "Stop Listening" : "Start Listening"}
// 			</button>
// 		</div>
// 	);
// };

// export default VoiceRecognition;
