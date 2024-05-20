"use client";

import SupportCard from "@/components/shared/SupportCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useConversations } from "@/hooks/useConversations";
import { useLogger } from "@/hooks/useLogger";
import { chatPartners } from "@/lib/chatPartners";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
	AdjustmentsHorizontalIcon,
	BellIcon,
	CheckIcon,
	PencilSquareIcon,
	PlusIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MoonLoader from "react-spinners/MoonLoader";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@headlessui/react";
import { Badge } from "@/components/ui/badge";
import { ArabicDialect } from "@/types/types";

// 	<span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
// 	Badge
//   </span>
//   <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
// 	Badge
//   </span>
//   <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
// 	Badge
//   </span>
//   <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
// 	Badge
//   </span>
//   <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
// 	Badge
//   </span>
//   <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
// 	Badge
//   </span>
//   <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
// 	Badge
//   </span>
//   <span className="inline-flex items-center rounded-md bg-pink-100 px-2 py-1 text-xs font-medium text-pink-700">
// 	Badge
//   </span>

const dialectColors: {
	[key in ArabicDialect]: [string, string];
} = {
	"Modern Standard Arabic": ["bg-blue-100", "text-blue-700"],
	Egyptian: ["bg-yellow-100", "text-yellow-800"],
	Levantine: ["bg-green-100", "text-green-700"],
	Gulf: ["bg-red-100", "text-red-700"],
	Maghrebi: ["bg-indigo-100", "text-indigo-700"],
	Sudanese: ["bg-purple-100", "text-purple-700"],
	Iraqi: ["bg-pink-100", "text-pink-700"],
	Yemeni: ["bg-gray-100", "text-gray-700"],
};

const DialectBadge = ({ dialect }: { dialect: ArabicDialect }) => {
	const [bg, text] = dialectColors[dialect];
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
				bg,
				text
			)}
		>
			{dialect}
		</span>
	);
};

const ChatPage = () => {
	const logger = useLogger({ label: "ChatPage", color: "#fe7de9" });

	const { user } = useUser();

	const router = useRouter();

	const { toast } = useToast();

	const { createConversation } = useConversations();

	const [isCreating, setIsCreating] = useState(false);

	const newChatHandler = async () => {
		try {
			setIsCreating(true);
			const { _id } = await createConversation();
			setIsCreating(false);
			router.push(`/chat/${_id}?new=true`);
		} catch (error) {
			setIsCreating(false);
			logger.error(error);
			toast({
				title: "Error creating chat",
				description:
					"An error occurred while creating a new chat, please try again later.",
				className: "error-toast",
			});
		}
	};

	const preferencesHandler = () => {
		router.push("/preferences");
	};

	return (
		<div className="py-10 bg-gray-50 flex-1 max-h-screen overflow-y-scroll">
			<header>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between">
						<h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
							{`Welcome ${user?.firstName} 👋`}
						</h1>
						<DropdownMenu>
							<DropdownMenuTrigger>Open</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuLabel>My Account</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>Profile</DropdownMenuItem>
								<DropdownMenuItem>Billing</DropdownMenuItem>
								<DropdownMenuItem>Team</DropdownMenuItem>
								<DropdownMenuItem>Subscription</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<p className="mt-2 text-lg text-gray-500 max-w-4xl">
						Get started by selecting a chat partner.
					</p>
				</div>
			</header>
			<main>
				{/* page content wrapper */}
				<div className="mr-auto max-w-7xl sm:px-6 lg:px-8 mt-8">
					{/* chat partner cards wrapper */}
					<div className="text-center flex items-stretch justify-center md:justify-start relative flex-wrap gap-4 lg:gap-6">
						{chatPartners.map((partner) => (
							<>
								<Card className={cn("w-[300px] bg-white flex flex-col")}>
									<CardHeader>
										<Image
											className="w-36 h-36 rounded-full mx-auto"
											width={12}
											height={12}
											src={partner.image}
											alt={partner.name}
											unoptimized
											priority
										/>
										<CardTitle>{partner.name}</CardTitle>
										<CardDescription>{partner.role}</CardDescription>
									</CardHeader>
									<CardContent className="gap-4 flex-1 flex flex-col justify-between">
										{/* <div className=" flex items-center space-x-4 rounded-md border p-4">
								<BellIcon />
								<div className="flex-1 space-y-1">
									<p className="text-sm font-medium leading-none">
										Push Notifications
									</p>
									<p className="text-sm text-muted-foreground">
										Send notifications to device.
									</p>
								</div>
								<Switch />
							</div> */}
										{/* {partner.conversationTopics.map((topic, index) => (
									<div
										key={index}
										className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
									>
										<span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
										<div className="space-y-1">
											<p className="text-sm font-medium leading-none">
												{topic}
											</p>
											<p className="text-sm text-muted-foreground">{topic}</p>
										</div>
									</div>
								))} */}
										<div className="flex flex-wrap gap-1">
											{partner.conversationTopics.map((topic) => (
												<Badge key={topic} variant="outline">
													{topic}
												</Badge>
											))}
										</div>

										<div className="flex flex-wrap gap-2">
											{partner.dialects.map((dialect) => (
												<DialectBadge dialect={dialect} key={dialect} />
											))}
										</div>
									</CardContent>
									<CardFooter>
										<Button className="w-full bg-indigo-600 hover:bg-indigo-500">
											New Chat
										</Button>
									</CardFooter>
								</Card>
							</>
						))}
					</div>
				</div>
			</main>
		</div>
	);

	return (
		<div className="text-center flex-1 flex items-center justify-center relative">
			<div>
				<PencilSquareIcon
					className="mx-auto h-12 w-12 text-gray-400"
					aria-hidden="true"
				/>
				<h3 className="mt-4 mb-4 text-xl font-semibold text-gray-900">
					{`Hi ${user?.username ?? user?.firstName ?? ""} 👋`}
				</h3>
				<p className="mt-1 text-sm text-gray-500">
					Get started by creating a new chat.
				</p>
				<div className="mt-6 flex flex-col gap-4">
					<Button
						type="button"
						className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						// className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-8 h-11 text-center me-2 mb-2 w-full md:w-fit"
						onClick={newChatHandler}
						disabled={isCreating}
					>
						{isCreating && <MoonLoader size={20} color="#fff" />}
						{!isCreating && (
							<>
								<PlusIcon
									className="-ml-0.5 mr-1.5 h-5 w-5"
									aria-hidden="true"
								/>
								New Chat
							</>
						)}
					</Button>
					<Button
						variant="outline"
						type="button"
						className={cn(
							"inline-flex items-center rounded-md  px-3 py-2 text-sm font-semibold shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 text-slate-600"
							// "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
						)}
						onClick={preferencesHandler}
						disabled={isCreating}
						// className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-8 h-11 text-center me-2 mb-2 w-full md:w-fit"
					>
						<AdjustmentsHorizontalIcon
							className="-ml-0.5 mr-1.5 h-5 w-5"
							aria-hidden="true"
						/>
						Preferences
					</Button>
				</div>
			</div>
			<SupportCard className="absolute bottom-0 right-0" />
		</div>
	);
};

export default ChatPage;
