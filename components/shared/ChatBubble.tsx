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

const ChatBubble = ({
	name,
	avatarSrc,
	avatarAlt,
	content,
	dropdownItems,
	time,
	status,
	rtl = false,
	className = "",
	reverse = false,
	glow = false,
}: {
	name: string;
	avatarSrc: string;
	avatarAlt: string;
	content: JSX.Element;
	status?: "delivered" | "read";
	dropdownItems?: (
		| {
				label: string;
				icon: (props: any) => React.JSX.Element;
				onClick: () => void;
		  }
		| "separator"
	)[];
	time?: string;
	rtl?: boolean;
	className?: string;
	reverse?: boolean;
	glow?: boolean;
}) => {
	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	const dropDownMenu = dropdownItems && (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button
					size="icon"
					variant="ghost"
					className="hover:bg-slate-100 hover:bg-opacity-50"
				>
					<svg
						className={cn(
							"text-slate-500 dark:text-slate-400",
							isMobile && "w-4 h-4",
							!isMobile && "w-5 h-5"
						)}
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 4 15"
					>
						<path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
					</svg>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className={cn(isMobile && "ml-3")}>
				{dropdownItems.map((item, ind) => {
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

	return (
		<div
			className={cn(
				"flex align-center gap-3 md:gap-5",
				reverse && "flex-row-reverse",
				isMobile && "width-full flex-1"
			)}
		>
			{!isMobile && (
				<Image
					className="w-14 h-14 rounded-full mt-4"
					width={16}
					height={16}
					src={avatarSrc}
					alt={avatarAlt}
				/>
			)}
			<BackgroundGradient
				className={cn(!isMobile && "max-w-2xl", isMobile && "flex-1")}
				animate={false}
				glow={glow}
			>
				<div
					className={cn(
						"pl-8 relative rounded-[22px] bg-slate-100 bg-opacity-80 lex items-start gap-2.5",
						reverse && "flex-row-reverse",
						className
					)}
				>
					<div
						className={cn(
							"flex flex-col leading-1.5 p-4 rounded-xl bg-opacity-25"
							// 'border-gray-200 bg-slate-400  dark:bg-slate-700 rounded-e-xl rounded-es-xl'
						)}
					>
						<div
							className={cn(
								"flex items-center space-x-2",
								reverse && "justify-end space-x-reverse"
							)}
						>
							{/* <span className="text-lg font-semibold text-slate-900 dark:text-white">
						{name}
					</span> */}
							{time && (
								<span className="text-sm font-normal text-slate-500 dark:text-slate-400">
									{time}
								</span>
							)}
							{isMobile && (
								<Image
									className="w-10 h-10 rounded-full"
									width={12}
									height={12}
									src={avatarSrc}
									alt="Araby Buddy logo"
								/>
							)}
						</div>
						<p
							className={cn(
								"text-xl md:text-3xl lg:text-3xl font-normal py-2.5 text-slate-900 dark:text-white"
							)}
							style={{ direction: rtl ? "rtl" : "ltr" }}
						>
							{content}
						</p>
						{status && (
							<span className="text-sm font-normal text-slate-500 dark:text-slate-400">
								Delivered
							</span>
						)}
					</div>
					<div className="absolute top-3 left-2">{dropDownMenu}</div>
				</div>
			</BackgroundGradient>
		</div>
	);
};

export default ChatBubble;
