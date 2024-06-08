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

const TranslationWrapper = ({
	arabicWordContent,
	englishWordContent,
}: {
	arabicWordContent: JSX.Element;
	englishWordContent: JSX.Element;
}) => (
	<div className="flex flex-col items-center gap-1">
		<div className="text-lg sm:text-xl tracking-wide">{arabicWordContent}</div>
		<div
			className="text-lg text-muted-foreground font-light leading-tight"
			style={{ direction: "ltr" }}
		>
			{englishWordContent}
		</div>
	</div>
);

const MessageCard = ({
	message,
	assistant,
	dialect,
	isPlaying,
	currentTime,
	dictionaryMode,
	translationMode,
	onDictionaryWordClicked,
	showLoadingOverlay = false,
	showSkeleton = false,
}: {
	message: IMessage;
	assistant: ChatPartner;
	dialect: ArabicDialect;
	isPlaying: boolean;
	currentTime: number;
	dictionaryMode: boolean;
	onDictionaryWordClicked: (id: string) => void;
	translationMode: boolean;
	showLoadingOverlay?: boolean;
	showSkeleton?: boolean;
}) => {
	const { role, content, wordMetadata } = message;

	const { user } = useUser();

	const name = role === "assistant" ? assistant.name : "You";
	const avatarSrc =
		role === "assistant"
			? assistant.image
			: user?.imageUrl ?? "/assets/user.svg";
	const avatarAlt =
		role === "assistant" ? assistant.name : user?.username ?? "User avatar";

	const nameContent = (
		<>
			{showSkeleton && <Skeleton className="h-6 sm:h-7 w-[100px]" />}
			{!showSkeleton && name && <span>{name}</span>}
		</>
	);

	const avatarContent = (
		<>
			{showSkeleton && (
				<Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
			)}
			{!showSkeleton && (
				<Image
					className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
					width={20}
					height={20}
					src={avatarSrc}
					alt={avatarAlt}
					unoptimized
					priority
				/>
			)}
		</>
	);

	const topBarContent = (
		<div className="flex justify-between">
			<div className="flex gap-2">
				<DialectBadge
					className="self-start text-md"
					dialect={dialect}
					shorten
				/>
				{isPlaying && (
					<SpeakerWaveIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400 transition ease-in-out" />
				)}
			</div>

			<div className="flex items-center gap-2">
				<span className="text-md sm:text-lg font-medium md:font-semibold">
					{nameContent}
				</span>
				{avatarContent}
			</div>
		</div>
	);

	const textContent = useMemo(() => {
		const isShowingTranslation =
			translationMode && message.wordMetadata.length > 0;
		// && (!dictionaryMode || isPlaying);

		if (!dictionaryMode && !isShowingTranslation && !isPlaying) {
			return <span>{message?.content}</span>;
		}

		return (
			<div
				style={{
					direction: "rtl",
				}}
				className={cn(
					"flex flex-wrap p-1",
					dictionaryMode && "gap-2",
					isPlaying && "gap-1",
					isShowingTranslation && "gap-3 sm:gap-4"
				)}
			>
				{message?.wordMetadata.map(
					({ _id, arabic, english, startTime }, ind) => {
						const isLastWord = ind === message.wordMetadata.length - 1;

						const currentTimeMoreThanStartTime = currentTime >= startTime;

						const nextWordStarted = isLastWord
							? false
							: currentTime >= message.wordMetadata[ind + 1].startTime;

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
							} else if (dictionaryMode) {
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

						if (dictionaryMode) {
							return dictionaryWord;
						}

						return <span key={_id}>{arabic}</span>;
					}
				)}
			</div>
		);
	}, [
		translationMode,
		message.wordMetadata,
		message?.content,
		dictionaryMode,
		isPlaying,
		currentTime,
		onDictionaryWordClicked,
	]);

	return (
		<Card className="relative flex-1 flex flex-col shadow-xl h-full bg-white text-slate-900">
			<CardHeader className="p-4 sm:p-6 pb-[0.5rem] sm:pb-[0.5rem]">
				{topBarContent}
			</CardHeader>
			<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 bg-opacity-50 overflow-y-scroll">
				<div
					className={cn(
						"text-lg leading-loose sm:text-xl sm:leading-loose font-normal   min-w-[130px] lg:min-w-[250px]",
						cairo.className
					)}
					style={{ direction: "rtl" }}
				>
					{showSkeleton && (
						<div className="space-y-3">
							<Skeleton className="w-full h-6 sm:h-7 " />
							{/* <Skeleton className="w-full h-6 sm:h-7 " /> */}
							<Skeleton className="w-1/2 h-6 sm:h-7 " />
						</div>
					)}

					{!showSkeleton && textContent}
				</div>
				{showLoadingOverlay && (
					<div className="absolute inset-0 w-full h-full bg-white bg-opacity-60 flex items-center justify-center"></div>
				)}
			</CardContent>
			{/* <CardFooter className="sm:hidden"> */}
			{/* <div className="mx-auto">{menuContent}</div> */}
			{/* </CardFooter> */}
		</Card>
	);
};

export default MessageCard;
