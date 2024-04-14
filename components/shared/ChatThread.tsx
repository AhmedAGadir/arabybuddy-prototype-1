import React, { useState } from "react";
import ChatBubble from "./ChatBubble";
import { ChatMessage } from "@/types/messageTypes";
import CursorSVG from "./CursorSVG";
import { cairo } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const ChatThread = ({
	chatHistory,
	isPlaying = false,
	containerRef,
}: {
	chatHistory: ChatMessage[];
	isPlaying: boolean;
	containerRef: React.RefObject<HTMLDivElement>;
}) => {
	const [completedTyping, setCompletedTyping] = useState(false);

	// // just a fancy way to type out the latest message
	// const setChatHistoryWithTypewriterOnLatestMessage = (
	// 	chatHistory: ChatMessage[]
	// ) => {
	// 	const previousChatHistory = chatHistory.slice(0, chatHistory.length - 1);
	// 	const latestChatMessage = _.last(chatHistory) as ChatMessage;

	// 	setCompletedTyping(false);

	// 	let i = 0;

	// 	const intervalId = setInterval(() => {
	// 		setChatHistory([
	// 			...previousChatHistory,
	// 			{
	// 				...latestChatMessage,
	// 				content: latestChatMessage.content.slice(0, i),
	// 			},
	// 		]);

	// 		i++;

	// 		if (i > latestChatMessage.content.length) {
	// 			clearInterval(intervalId);
	// 			setCompletedTyping(true);
	// 		}
	// 	}, 50);

	// 	return () => clearInterval(intervalId);
	// };

	return (
		<div
			className="overflow-scroll w-full h-full"
			// ref={containerRef} // used this for scroll to latest message functionality
		>
			<div className="flex flex-col justify-center gap-8 h-full mx-auto max-w-xl ">
				{chatHistory.map((chatMessage, ind) => {
					const isLastChatMessage = ind === chatHistory.length - 1;

					const isUserMessage = chatMessage.role === "user";
					const key = `${ind}-${chatMessage.content.slice(0, 5)}`;

					if (isUserMessage) {
						return (
							<ChatBubble
								key={key}
								name="User"
								className="max-w-2/3"
								avatarSrc="/assets/user.svg"
								avatarAlt="User Avatar"
								rtl={true}
								content={
									<span className={`${cairo.className} font-light`}>
										{chatMessage.content ?? ""}
									</span>
								}
							/>
						);
					}
					return (
						<ChatBubble
							key={`${ind}-${chatMessage.content.slice(0, 5)}`}
							name="ArabyBuddy"
							avatarSrc="/assets/arabybuddy.svg"
							avatarAlt="ArabyBuddy Avatar"
							rtl={true}
							reverse={true}
							className="max-w-2/3 "
							content={
								<span
									className={cn(
										"font-light",
										cairo.className,
										isLastChatMessage && isPlaying && "text-araby-purple"
									)}
								>
									{chatMessage.content ?? ""}
									{isLastChatMessage && isPlaying && !completedTyping && (
										<CursorSVG />
									)}
								</span>
							}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default ChatThread;
