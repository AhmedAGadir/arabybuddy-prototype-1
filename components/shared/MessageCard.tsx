import React from "react";
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

const MessageCard = ({
	name,
	avatar,
	content,
	menuContent,
	glow = false,
	showLoadingOverlay = false,
	showSkeleton = false,
	className,
}: {
	name?: string;
	avatar: {
		src?: string;
		alt?: string;
	};
	content: JSX.Element;
	menuContent?: JSX.Element;
	glow?: boolean;
	showLoadingOverlay?: boolean;
	showSkeleton?: boolean;
	className?: string;
}) => {
	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	const nameContent = (
		<>
			{showSkeleton && <Skeleton className="h-6 sm:h-7 w-[100px]" />}
			{!showSkeleton && name && <span>{name}</span>}
		</>
	);

	const avatarContent = (
		<>
			{showSkeleton && (
				<Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
			)}
			{!showSkeleton && (
				<Image
					className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
					width={12}
					height={12}
					src={avatar?.src ?? "/assets/user.png"}
					alt={avatar?.alt ?? "Avatar"}
					unoptimized
					priority
				/>
			)}
		</>
	);

	const topBarContent = (
		<div className={cn("flex justify-between")}>
			{/* <div className="block sm:hidden" /> */}
			{/* <div className="hidden sm:block">{menuContent ?? null}</div> */}
			{menuContent ?? <div />}

			<div className="flex items-center gap-2">
				<span className="text-md sm:text-lg font-medium md:font-semibold">
					{nameContent}
				</span>
				{avatarContent}
			</div>
		</div>
	);

	const textContent = (
		<>
			{showSkeleton && (
				<div className="space-y-3">
					<Skeleton className="w-full h-6 sm:h-7 " />
					{/* <Skeleton className="w-full h-6 sm:h-7 " /> */}
					<Skeleton className="w-1/2 h-6 sm:h-7 " />
				</div>
			)}

			{!showSkeleton && content}
		</>
	);

	return (
		<Card className={cn("relative flex-1 flex flex-col shadow-xl", className)}>
			<CardHeader className="p-4 sm:p-6">{topBarContent}</CardHeader>
			<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 bg-opacity-50 overflow-y-scroll">
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
			{/* <CardFooter className="sm:hidden"> */}
			{/* <div className="mx-auto">{menuContent}</div> */}
			{/* </CardFooter> */}
		</Card>
	);
};

export default MessageCard;
