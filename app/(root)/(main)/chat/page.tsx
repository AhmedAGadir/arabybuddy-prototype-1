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
	FunnelIcon,
	MapPinIcon,
	PencilSquareIcon,
	PlusIcon,
	RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@headlessui/react";
import { Badge } from "@/components/ui/badge";
import { ARABIC_DIALECTS, ArabicDialect } from "@/types/types";
import { Toggle } from "@/components/ui/toggle";
import { filter } from "lodash";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { BoltSlashIcon } from "@heroicons/react/20/solid";

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

	const statusIndicator = (
		<span className="relative flex h-2 w-2">
			<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
			<span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
		</span>
	);

	const [filteredDialects, setFilteredDialects] = useState<ArabicDialect[]>(
		localStorage
			? JSON.parse(localStorage.getItem("filteredDialects") ?? "[]")
			: []
	);

	const onDialectFilterChange = useCallback(
		(dialect: ArabicDialect, pressed: boolean) => {
			const nextFiltered = pressed
				? [...filteredDialects, dialect]
				: filteredDialects.filter((d) => d !== dialect);

			setFilteredDialects(nextFiltered);

			if (localStorage) {
				localStorage.setItem("filteredDialects", JSON.stringify(nextFiltered));
			}
		},
		[filteredDialects]
	);

	const filteredChatPartners = useMemo(() => {
		if (filteredDialects.length === 0) return chatPartners;
		return chatPartners.filter((partner) =>
			partner.dialects.some((dialect) => filteredDialects.includes(dialect))
		);
	}, [filteredDialects]);

	const nonFilteredChatPartners = useMemo(() => {
		if (filteredDialects.length === 0) return [];
		return chatPartners.filter(
			(partner) =>
				!partner.dialects.some((dialect) => filteredDialects.includes(dialect))
		);
	}, [filteredDialects]);

	const sortedChatPartners = [
		...filteredChatPartners,
		...nonFilteredChatPartners,
	];

	const chatPartnersContent = sortedChatPartners.map((partner) => {
		const filtered = filteredChatPartners.includes(partner);
		const nonFiltered = nonFilteredChatPartners.includes(partner);
		return (
			<Card
				className={cn(
					"w-[300px] bg-background flex flex-col group/card relative transition-all ease-in duration-50",
					nonFiltered && "filter blur-sm"
				)}
			>
				{nonFiltered && (
					<div
						className={cn(
							"absolute top-0 left-0 h-full w-full bg-primary-foreground opacity-60 z-20 filter blur-sm flex items-center justify-center"
						)}
					></div>
				)}
				<CardHeader>
					<Image
						className={cn(
							"w-36 h-36 rounded-full mx-auto",
							filtered &&
								partner.id !== "arabybuddy" &&
								"ring-2 ring-slate-300 ring-offset-4 ring-offset-slate-50 mb-3 group-hover/card:ring-indigo-600 transition-all ease-in duration-50"
						)}
						width={12}
						height={12}
						src={partner.image}
						alt={partner.name}
						unoptimized
						priority
					/>
					{partner.location && (
						<div className="text-muted-foreground font-medium leading-none tracking-tight text-xs uppercase flex items-center gap-0.5 justify-center">
							<MapPinIcon className="w-4 h-4" />
							{`${partner.location[0]}, ${partner.location[1]}`}
						</div>
					)}
					<CardTitle>
						<span className="relative w-fit">
							{partner.name}
							<span className="absolute -right-4">{statusIndicator}</span>
						</span>
					</CardTitle>
					<CardDescription>{partner.role}</CardDescription>
				</CardHeader>
				<CardContent className="gap-3 flex-1 flex flex-col justify-between">
					<p className="text-xs text-left text-muted-foreground tracking-tight leading-none">
						Speaks
					</p>
					<div className="flex flex-wrap gap-2">
						{partner.dialects.map((dialect) => (
							<DialectBadge dialect={dialect} key={dialect} />
						))}
					</div>

					<p className="text-xs text-left text-muted-foreground tracking-tight leading-none">
						Themes
					</p>
					<div className="flex flex-wrap gap-1">
						{partner.conversationTopics.map((topic) => (
							<Badge key={topic} variant="secondary">
								{topic}
							</Badge>
						))}
					</div>
				</CardContent>
				<CardFooter>
					<Button
						variant="outline"
						disabled={nonFiltered}
						className="w-full border-indigo-600 text-indigo-600 hover:text-secondary hover:bg-indigo-600"
					>
						Start Chat
					</Button>
				</CardFooter>
			</Card>
			// </div>
		);
	});

	const filterContent = (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost">
					<div className="flex items-center gap-2">
						<div className="flex gap-1">
							Filter by Dialect
							{filteredDialects.length > 0 && (
								<div className="h-5 w-5 relative rounded-full bg-primary text-primary-foreground ">
									<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
										{filteredDialects.length}
									</span>
								</div>
							)}
						</div>
						<FunnelIcon className="w-6 h-6" />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-fit flex flex-col p-0 py-2">
				{ARABIC_DIALECTS.map((dialect) => (
					<Toggle
						pressed={filteredDialects.includes(dialect)}
						onPressedChange={(pressed: boolean) =>
							onDialectFilterChange(dialect, pressed)
						}
						asChild
					>
						<Button
							key={dialect}
							variant="ghost"
							className="font-medium rounded-none justify-start gap-1 pr-5"
						>
							<CheckIcon
								className={cn(
									"w-5 h-5",
									filteredDialects.includes(dialect)
										? "text-primary"
										: "text-transparent"
								)}
							/>
							{dialect}
						</Button>
					</Toggle>
				))}
				<div className="px-2 mt-2">
					<Button
						variant="outline"
						className="w-full"
						onClick={() => setFilteredDialects([])}
						disabled={filteredDialects.length === 0}
					>
						Clear Filters
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);

	const salutationContent = (
		<h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
			{/* TODO: show skeleton loader */}
			{`Welcome ${user?.firstName ?? ""} 👋`}
		</h1>
	);

	const alertBarContent = filteredDialects.length > 0 && (
		<Alert variant="blue">
			{/* <RocketLaunchIcon className="h-5 w-5" /> */}
			<BoltSlashIcon className="h-5 w-5 fill-blue-600" />
			<AlertTitle>Heads up!</AlertTitle>
			<AlertDescription>
				<Link href="#" className="hover:underline">
					Upgrade to Pro to unlock every dialect for all chat partners.
				</Link>
			</AlertDescription>
		</Alert>
	);

	return (
		<div className="py-10 bg-gray-50 flex-1 max-h-screen overflow-y-scroll">
			<header>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between">
						{salutationContent}
						{filterContent}
					</div>
					<div className="my-4">{alertBarContent}</div>
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
						{chatPartnersContent}
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
