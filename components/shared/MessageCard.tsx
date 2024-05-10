import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BackgroundGradient } from "../ui/background-gradient";
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

const MessageCard = ({
	name,
	avatarSrc,
	avatarAlt,
	content,
	menuContent,
	glow = false,
	showLoadingOverlay = false,
	className,
}: {
	name?: string;
	avatarSrc: string;
	avatarAlt: string;
	content: JSX.Element;
	menuContent?: JSX.Element;
	glow?: boolean;
	showLoadingOverlay?: boolean;
	className?: string;
}) => {
	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	const topBarContent = (
		<div className={cn("flex justify-between")}>
			{/* <div className="block sm:hidden" /> */}
			{/* <div className="hidden sm:block">{menuContent ?? null}</div> */}
			{menuContent ?? null}

			<div className="flex items-center gap-2">
				{name && (
					<span className="text-md sm:text-lg font-medium md:font-semibold">
						{name}
					</span>
				)}

				<Image
					className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
					width={12}
					height={12}
					src={avatarSrc}
					alt={avatarAlt}
					unoptimized
				/>
			</div>
		</div>
	);

	{
		/* <button class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
<span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
Purple to blue
</span>
</button> */
	}

	return (
		// <div
		// 	className={cn(
		// 		"p-[2px] rounded-lg",
		// 		glow &&
		// 			"bg-[radial-gradient(circle_farthest-side_at_0_100%,#38B6FF,transparent),radial-gradient(circle_farthest-side_at_100%_0,#5E17EB,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
		// 	)}
		// >
		<Card
			className={cn(
				"relative flex-1 flex flex-col shadow-xl",
				// isMobile && "w-full",
				// glow && "shadow-lg",
				className
			)}
		>
			<CardHeader className="p-4 sm:p-6">{topBarContent}</CardHeader>
			<CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 bg-opacity-50 overflow-y-scroll">
				<div
					className={cn(
						"text-lg leading-loose sm:text-xl sm:leading-loose font-normal   min-w-[130px] lg:min-w-[250px]",
						cairo.className
					)}
					style={{ direction: "rtl" }}
				>
					{content}
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
