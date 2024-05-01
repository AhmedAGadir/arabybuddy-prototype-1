import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BackgroundGradient } from "../ui/background-gradient";
import { useMediaQuery } from "@react-hooks-hub/use-media-query";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

const ChatBubble = ({
	name,
	avatarSrc,
	avatarAlt,
	content,
	chatMenuItems,
	chatMenuDisabled = false,
	time,
	status,
	rtl = true,
	reverse = false,
	glow = false,
	className,
}: {
	name?: string;
	avatarSrc: string;
	avatarAlt: string;
	content: JSX.Element;
	status?: "delivered" | "read";
	chatMenuItems?: (
		| {
				label: string;
				icon: (props: any) => React.JSX.Element;
				onClick: () => void;
		  }
		| "separator"
	)[];
	chatMenuDisabled?: boolean;
	time?: string;
	rtl?: boolean;
	reverse?: boolean;
	glow?: boolean;
	className?: string;
}) => {
	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	const dropDownMenu = chatMenuItems && (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(chatMenuDisabled && "pointer-events-none")}
			>
				<Button
					size="icon"
					variant="ghost"
					className={cn(
						"hover:bg-slate-100",
						chatMenuDisabled && "opacity-50 hover:bg-transparent"
					)}
				>
					<EllipsisVerticalIcon className="text-slate-500 dark:text-slate-400 w-6 h-6" />
				</Button>
				{/* <Button
					size="sm"
					className={cn(
						"text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2",
						chatMenuDisabled && "hidden"
					)}
				>
					actions
				</Button> */}
			</DropdownMenuTrigger>
			<DropdownMenuContent className={cn(isMobile && "ml-3")}>
				{chatMenuItems.map((item, ind) => {
					if (item === "separator")
						return <DropdownMenuSeparator key={ind + "-separator"} />;
					return (
						<DropdownMenuItem key={item.label} onClick={item.onClick}>
							<span className="mr-2">{<item.icon className="w-5 h-5" />}</span>{" "}
							{item.label}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);

	const topBarContent = (
		<div
			className={cn(
				"flex items-center space-x-2 gap-2",
				reverse && "justify-end space-x-reverse"
			)}
		>
			{name && (
				<span className="text-lg font-medium md:font-semibold text-slate-900 dark:text-white">
					{name}
				</span>
			)}
			{time && (
				<span className="text-sm font-normal text-slate-500 dark:text-slate-400">
					{time}
				</span>
			)}
			{/* {isMobile && ( */}
			{true && (
				<Image
					className="w-10 h-10 rounded-full"
					width={12}
					height={12}
					src={avatarSrc}
					alt="Araby Buddy logo"
				/>
			)}
		</div>
	);

	const statusContent = status && (
		<span className="text-sm font-normal text-slate-500 dark:text-slate-400">
			Delivered
		</span>
	);

	return (
		<div
			className={cn(
				"flex-1 flex align-center gap-3 md:gap-5",
				reverse && "flex-row-reverse",
				isMobile && "width-full flex-1",
				className
				// glow &&
				// 	"bg-[radial-gradient(circle_farthest-side_at_0_100%,#38B6FF,transparent),radial-gradient(circle_farthest-side_at_100%_0,#5E17EB,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
			)}
			// animate={false}
			// glow={glow}
		>
			<div
				className={cn(
					"relative flex items-start gap-2.5 w-full border border-gray-500",
					// "rounded-[22px]",
					// "bg-slate-100 bg-opacity-85", // use this when using the background gradient component
					reverse && "flex-row-reverse"
				)}
			>
				<div
					className={cn(
						"h-full flex flex-col leading-1.5 p-4 rounded-xl "
						// 'border-gray-200 bg-slate-400  dark:bg-slate-700 rounded-e-xl rounded-es-xl'
					)}
				>
					{topBarContent}
					<p
						className={cn(
							"overflow-y-scroll text-xl md:text-3xl lg:text-3xl font-normal py-2.5 text-slate-900 dark:text-white min-w-[130px]"
						)}
						style={{ direction: rtl ? "rtl" : "ltr" }}
					>
						{content}
					</p>
					{statusContent}
				</div>
				<div className="absolute top-3 left-2">{dropDownMenu}</div>
			</div>
		</div>
	);
};

export default ChatBubble;
