import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { NewBadge } from "@/components/shared/NewBadge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { status, type Status } from "@/types/types";

import {
	ArrowPathIcon,
	BookOpenIcon,
	MicrophoneIcon as MicrophoneIconOutline,
	PlayIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";

import { StopIcon, XCircleIcon } from "@heroicons/react/20/solid";

import { TranslateIcon } from "@/components/shared/icons/Translate";

type IconType = React.FC<any> | (() => JSX.Element);

interface BasePanelItem {
	label: string;
	disabled: boolean;
	icon: IconType;
	iconClasses?: string;
	new?: boolean;
}

interface ButtonPanelItem extends BasePanelItem {
	onClick: () => void;
	isToggle?: never;
	pressed?: never;
	onPressed?: never;
}

interface TogglePanelItem extends BasePanelItem {
	isToggle: boolean;
	pressed: boolean;
	onPressed: (pressed: boolean) => void;
	onClick?: never;
}

type PanelItem = ButtonPanelItem | TogglePanelItem;

const ChatPanel = ({
	chatStatus,
	previousMessageHandler,
	nextMessageHandler,
	isFirstMessage,
	isLastMessage,
	isMessage,
	isUserMessage,
	replayBtnHandler,
	abortProcessingBtnHandler,
	stopPlayingHandler,
	redoCompletionHandler,
	toggleRecordingHandler,
	toggleDictionaryHandler,
	toggleTranslationHandler,
	dictionaryMode,
	translationMode,
}: {
	chatStatus: Status;
	previousMessageHandler: () => void;
	nextMessageHandler: () => void;
	isFirstMessage: boolean;
	isLastMessage: boolean;
	isMessage: boolean;
	isUserMessage: boolean;
	isAssistantMessage: boolean;
	replayBtnHandler: () => void;
	abortProcessingBtnHandler: () => void;
	stopPlayingHandler: () => void;
	redoCompletionHandler: (params: {
		mode: "REGENERATE" | "REPHRASE";
	}) => Promise<void>;
	toggleRecordingHandler: () => void;
	toggleDictionaryHandler: () => void;
	toggleTranslationHandler: () => void;
	dictionaryMode: boolean;
	translationMode: boolean;
}) => {
	const isIdle = chatStatus === status.IDLE;
	const isRecording = chatStatus === status.RECORDING;
	const isPlaying = chatStatus === status.PLAYING;
	const isProcessing = chatStatus === status.PROCESSING;

	const panelItems: PanelItem[] = useMemo(() => {
		return [
			{
				label: "Previous",
				icon: () => <span>Prev</span>,
				onClick: previousMessageHandler,
				disabled: !isMessage || isFirstMessage || isRecording || isPlaying,
			},
			...(isIdle || isRecording
				? [
						{
							label: "Replay",
							icon: PlayIcon,
							onClick: replayBtnHandler,
							disabled: !isMessage || !isIdle,
						},
				  ]
				: []),
			...(isProcessing
				? [
						{
							label: "Cancel",
							icon: XCircleIcon,
							iconClasses: "text-white w-8 h-8",
							isToggle: true,
							pressed: true,
							onPressed: abortProcessingBtnHandler,
							disabled: false,
						},
				  ]
				: []),
			...(isPlaying
				? [
						{
							label: "Stop Playing",
							icon: StopIcon,
							iconClasses: "text-indigo-600 w-8 h-8",
							onClick: stopPlayingHandler,
							disabled: false,
						},
				  ]
				: []),
			...(isUserMessage
				? [
						{
							label: "Rephrase",
							icon: SparklesIcon,
							new: true,
							onClick: () => redoCompletionHandler({ mode: "REPHRASE" }),
							disabled: !isMessage || !isIdle,
						},
				  ]
				: [
						{
							label: "Regenerate",
							icon: ArrowPathIcon,
							onClick: () => redoCompletionHandler({ mode: "REGENERATE" }),
							disabled: !isMessage || !isIdle,
						},
				  ]),
			{
				label: "Record",
				isToggle: true,
				pressed: isRecording,
				onPressed: toggleRecordingHandler,
				icon: MicrophoneIconOutline,
				disabled: isProcessing,
			},
			{
				label: "Dictionary",
				isToggle: true,
				pressed: dictionaryMode,
				onPressed: toggleDictionaryHandler,
				icon: BookOpenIcon,
				disabled: false,
			},
			{
				label: "Translate",
				icon: TranslateIcon,
				isToggle: true,
				pressed: translationMode,
				onPressed: toggleTranslationHandler,
				disabled: false,
			},
			{
				label: "Next",
				icon: () => <span>Next</span>,
				onClick: nextMessageHandler,
				disabled: !isMessage || isLastMessage || isRecording || isPlaying,
			},
		];
	}, [
		previousMessageHandler,
		isMessage,
		isFirstMessage,
		isRecording,
		isPlaying,
		isIdle,
		replayBtnHandler,
		isProcessing,
		abortProcessingBtnHandler,
		stopPlayingHandler,
		isUserMessage,
		toggleRecordingHandler,
		dictionaryMode,
		toggleDictionaryHandler,
		translationMode,
		toggleTranslationHandler,
		nextMessageHandler,
		isLastMessage,
		redoCompletionHandler,
	]);

	return (
		<Card className="shadow-lg p-2">
			<CardContent className="flex items-center p-0">
				<div className="flex gap-2">
					{panelItems.map((item) => {
						return (
							<TooltipProvider key={item.label} delayDuration={0}>
								<Tooltip>
									<TooltipTrigger>
										<>
											{item.isToggle && (
												<Toggle
													size="default"
													className={
														cn(
															"h-11 w-11 sm:h-14 sm:w-14 text-slate-500 dark:text-slate-400 hover:bg-slate-100",
															"data-[state=on]:bg-primary data-[state=on]:text-white hover:data-[state=on]:bg-primary/80 px-2"
															// "data-[state=on]:bg-slate-500 data-[state=on]:text-white hover:data-[state=on]:bg-slate-400 px-2 "
														)
														// "relative text-slate-500 dark:text-slate-400 hover:bg-slate-100",
														// item.pressed && "bg-slate-400"
													}
													pressed={item.pressed}
													onPressedChange={item.onPressed}
													disabled={item.disabled}
												>
													<item.icon
														className={cn("w-6 h-6", item.iconClasses)}
													/>
												</Toggle>
											)}
											{!item.isToggle && (
												<Button
													size="icon"
													variant="ghost"
													className="relative h-11 w-11 sm:h-14 sm:w-14 text-slate-500 dark:text-slate-400 hover:bg-slate-100"
													onClick={item.onClick}
													disabled={item.disabled}
												>
													<item.icon
														className={cn("w-6 h-6", item.iconClasses)}
													/>
												</Button>
											)}
										</>
									</TooltipTrigger>
									<TooltipContent side="bottom" align="start">
										<span>{item.label}</span>
										{item.new && <NewBadge className="ml-2" />}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};

export default ChatPanel;
