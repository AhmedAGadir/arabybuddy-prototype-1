import React, { useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@react-hooks-hub/use-media-query";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cairo } from "@/lib/fonts";
import { Skeleton } from "../ui/skeleton";
import { IMessage } from "@/lib/database/models/message.model";
import { ChatPartner } from "@/lib/chatPartners";
import { ArabicDialect } from "@/types/types";
import { useUser } from "@clerk/nextjs";

import { SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { DialectBadge } from "@/components/shared/DialectBadge";
import { Badge } from "@/components/ui/badge";
import { TranslateIcon } from "@/components/shared/icons/Translate";

const TranslationWrapper = ({
	arabicWordContent,
	englishWordContent,
}: {
	arabicWordContent: JSX.Element;
	englishWordContent: JSX.Element;
}) => (
	<div className="flex flex-col items-center p-1">
		<div className="text-lg sm:text-xl tracking-wide">{arabicWordContent}</div>
		<div
			className="text-md sm:text-lg text-muted-foreground font-light leading-tight"
			style={{ direction: "ltr" }}
		>
			{englishWordContent}
		</div>
	</div>
);

type BaseState = {
	totalMessageCount: number;
	isProcessing: boolean;
	isPlaying: boolean;
	currentTime: number;
	dictionaryMode: boolean;
	onDictionaryWordClicked: (id: string) => void;
	translationMode: boolean;
	showLoadingOverlay: boolean;
};

type MessageLoadedState = {
	isLoading: false;
	message: IMessage;
	assistant: ChatPartner | undefined;
	dialect: ArabicDialect | undefined;
	messageInd: number;
};

type MessageLoadingState = {
	isLoading: true;
	message: null;
	assistant: undefined;
	dialect: undefined;
	messageInd: null;
};

type MessageCard = BaseState & (MessageLoadedState | MessageLoadingState);

const MessageCard = ({
	isLoading,
	message,
	assistant,
	dialect,
	messageInd,
	totalMessageCount,
	isProcessing,
	isPlaying,
	currentTime,
	dictionaryMode,
	translationMode,
	onDictionaryWordClicked,
	showLoadingOverlay,
}: MessageCard) => {
	const { user } = useUser();

	const allContentLoaded = !isLoading && message && assistant && dialect;

	const nameContent = useMemo(() => {
		if (!allContentLoaded) {
			return <Skeleton className="h-6 sm:h-7 w-[100px]" />;
		}

		const { role } = message;
		const { name: assistantName } = assistant;
		const name = role === "assistant" ? assistantName : "You";

		return <span>{name}</span>;
	}, [allContentLoaded, assistant, message]);

	const avatarContent = useMemo(() => {
		if (!allContentLoaded) {
			return <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />;
		}

		const { role } = message;
		const { name: assistantName, image: assistantImage } = assistant;

		const avatarSrc =
			role === "assistant"
				? assistantImage
				: user?.imageUrl ?? "/assets/user.svg";

		const avatarAlt =
			role === "assistant" ? assistantName : user?.username ?? "User avatar";

		return (
			<Image
				className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
				width={20}
				height={20}
				src={avatarSrc}
				alt={avatarAlt}
				unoptimized
				priority
			/>
		);
	}, [allContentLoaded, assistant, message, user?.imageUrl, user?.username]);

	const badgesContent = useMemo(() => {
		if (!allContentLoaded) {
			return (
				<div className="self-start flex gap-3 items-center">
					<Skeleton className="w-10 h-8" />
					<Skeleton className="w-8 h-8" />
				</div>
			);
		}

		const { wordMetadata } = message;

		const hasTranslation =
			wordMetadata.length > 0 && wordMetadata[0].english !== null;

		return (
			<div className="self-start flex gap-3 items-center">
				<DialectBadge
					className="self-start text-md"
					dialect={dialect}
					shorten
				/>
				{hasTranslation && (
					<span className="self-start bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-nowrap">
						<TranslateIcon className="w-6 h-6" />
					</span>
				)}
				{/* {isProcessing && (
					<span>
						<SendIcon className="self-start h-6 w-6 text-muted-foreground" />
					</span>
				)} */}
				{isPlaying && (
					<span>
						<SpeakerWaveIcon className="self-start w-7 h-7 text-slate-400 transition ease-in-out" />
					</span>
				)}
			</div>
		);
	}, [allContentLoaded, dialect, isPlaying, message]);

	const topBarContent = useMemo(() => {
		return (
			<div className="flex justify-between">
				{badgesContent}

				<div className="flex items-center gap-2">
					<span className="text-md sm:text-lg font-medium md:font-semibold">
						{nameContent}
					</span>
					{avatarContent}
				</div>
			</div>
		);
	}, [avatarContent, badgesContent, nameContent]);

	const textContent = useMemo(() => {
		if (!allContentLoaded) {
			return (
				<div className="space-y-3 w-full">
					<Skeleton className="w-full h-6 sm:h-7 " />
					<Skeleton className="w-full h-6 sm:h-7 " />
					<Skeleton className="w-1/2 h-6 sm:h-7 " />
				</div>
			);
		}

		const { content, wordMetadata } = message;

		const isShowingTranslation =
			translationMode &&
			wordMetadata.length > 0 &&
			wordMetadata[0].english !== null;
		// && (!dictionaryMode || isPlaying);

		const isShowingDictionary = dictionaryMode && wordMetadata.length > 0;

		if (!isShowingDictionary && !isShowingTranslation && !isPlaying) {
			return <span>{content}</span>;
		}

		return (
			<div
				style={{
					direction: "rtl",
				}}
				className={cn(
					"flex flex-wrap p-1",
					isPlaying && "gap-1",
					dictionaryMode && "gap-1 sm:gap-2",
					isShowingTranslation && "gap-1"
				)}
			>
				{wordMetadata.map(({ _id, arabic, english, startTime }, ind) => {
					const isLastWord = ind === wordMetadata.length - 1;

					const currentTimeMoreThanStartTime = currentTime >= startTime;

					const nextWordStarted = isLastWord
						? false
						: currentTime >= wordMetadata[ind + 1].startTime;

					const isActive = currentTimeMoreThanStartTime && !nextWordStarted;

					const playingWord = (
						<span
							key={_id}
							className={cn(
								isActive && "bg-indigo-600 text-white",
								"rounded-md p-1"
							)}
						>
							{arabic}
						</span>
					);

					const dictionaryWord = (
						<Badge
							key={_id}
							variant="secondary"
							className="text-lg cursor-pointer hover:bg-primary hover:text-white"
							onClick={() => {
								onDictionaryWordClicked(_id);
							}}
						>
							{arabic}
						</Badge>
					);

					if (isShowingTranslation) {
						let arabicWordContent;

						if (isPlaying) {
							arabicWordContent = playingWord;
						} else if (isShowingDictionary) {
							arabicWordContent = dictionaryWord;
						} else {
							arabicWordContent = <span>{arabic}</span>;
						}

						return (
							<TranslationWrapper
								key={_id}
								arabicWordContent={arabicWordContent}
								englishWordContent={<span>{english}</span>}
							/>
						);
					}

					if (isPlaying) {
						return playingWord;
					}

					if (isShowingDictionary) {
						return dictionaryWord;
					}

					return <span key={_id}>{arabic}</span>;
				})}
			</div>
		);
	}, [
		allContentLoaded,
		message,
		translationMode,
		dictionaryMode,
		isPlaying,
		currentTime,
		onDictionaryWordClicked,
	]);

	const messageIndexContent = !isLoading && (
		<div className="text-slate-400 mt-1 w-full text-right text-sm">
			{messageInd + 1} / {totalMessageCount}
		</div>
	);

	return (
		<Card className="relative flex-1 flex flex-col shadow-xl h-full bg-white text-slate-900">
			<CardHeader className="px-4 pt-4 sm:px-6 dm:pt-6 pb-[0.5rem]">
				{topBarContent}
			</CardHeader>
			<CardContent className="px-4 sm:px-6 pt-0 pb-0 bg-opacity-50 overflow-y-scroll">
				<div
					className={cn(
						"text-lg leading-loose sm:text-xl sm:leading-loose font-normal   min-w-[130px] lg:min-w-[250px]",
						cairo.className
					)}
					style={{ direction: "rtl" }}
				>
					{textContent}
				</div>
				{showLoadingOverlay && (
					<div className="absolute inset-0 w-full h-full bg-white bg-opacity-60 flex items-center justify-center"></div>
				)}
			</CardContent>
			<CardFooter className="px-4 pb-4 sm:px-6 dm:pb-6 pt-[0.5rem]">
				{messageIndexContent}
			</CardFooter>
		</Card>
	);
};

export default MessageCard;
