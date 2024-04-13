import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BackgroundGradient } from "../ui/background-gradient";
import { useMediaQuery } from "@react-hooks-hub/use-media-query";

const ChatBubble = ({
	name,
	avatarSrc,
	content,
	dropdownItems,
	time,
	status,
	rtl = false,
	className = "",
	reverse = false,
}: {
	name: string;
	avatarSrc: string;
	content: React.ReactNode;
	status?: "delivered" | "read";
	dropdownItems?: {
		label: string;
		onClick: () => void;
	}[];
	time?: string;
	rtl?: boolean;
	className?: string;
	reverse?: boolean;
}) => {
	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

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
					className="w-12 h-12 rounded-full mt-4"
					width={16}
					height={16}
					src={avatarSrc}
					alt="Araby Buddy logo"
				/>
			)}
			<BackgroundGradient
				className={cn(!isMobile && "max-w-2xl", isMobile && "flex-1")}
				animate={false}
			>
				<div
					className={cn(
						"rounded-[22px] bg-slate-100 bg-opacity-80 lex items-start gap-2.5",
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
							{true && (
								<span className="text-sm font-normal text-slate-500 dark:text-slate-400">
									{time}
								</span>
							)}
							{isMobile && (
								<Image
									className="w-8 l-8 lg:w-10 lg:h-10 rounded-full"
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
					{dropdownItems && (
						<>
							<button
								id="dropdownMenuIconButton"
								data-dropdown-toggle="dropdownDots"
								data-dropdown-placement="bottom-start"
								className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-slate-900 bg-white rounded-lg hover:bg-slate-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus:ring-slate-600"
								type="button"
							>
								<svg
									className="w-4 h-4 text-slate-500 dark:text-slate-400"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="currentColor"
									viewBox="0 0 4 15"
								>
									<path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
								</svg>
							</button>
							<div
								id="dropdownDots"
								className="z-10 hidden bg-white divide-y divide-slate-100 rounded-lg shadow w-40 dark:bg-slate-700 dark:divide-slate-600"
							>
								<ul
									className="py-2 text-sm text-slate-700 dark:text-slate-200"
									aria-labelledby="dropdownMenuIconButton"
								>
									<li>
										<a
											href="#"
											className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 dark:hover:text-white"
										>
											Reply
										</a>
									</li>
									<li>
										<a
											href="#"
											className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 dark:hover:text-white"
										>
											Forward
										</a>
									</li>
									<li>
										<a
											href="#"
											className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 dark:hover:text-white"
										>
											Copy
										</a>
									</li>
									<li>
										<a
											href="#"
											className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
										>
											Report
										</a>
									</li>
									<li>
										<a
											href="#"
											className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
										>
											Delete
										</a>
									</li>
								</ul>
							</div>
						</>
					)}
				</div>
			</BackgroundGradient>
		</div>
	);
};

export default ChatBubble;
