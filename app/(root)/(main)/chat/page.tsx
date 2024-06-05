"use client";

import SupportCard from "@/components/shared/SupportCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useConversations } from "@/hooks/useConversations";
import { useLogger } from "@/hooks/useLogger";
import { ChatPartner, ChatPartnerId, chatPartners } from "@/lib/chatPartners";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createRef, useCallback, useMemo, useState } from "react";
import MoonLoader from "react-spinners/MoonLoader";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ARABIC_DIALECTS, ArabicDialect } from "@/types/types";
import { Toggle } from "@/components/ui/toggle";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { BoltSlashIcon } from "@heroicons/react/20/solid";
import { DialectBadge } from "@/components/shared/DialectBadge";
import ChatPartnerAvatar from "@/components/shared/ChatPartnerAvatar";

import DialectDialog from "@/components/shared/DialectDialog";

const ChatPage = () => {
	const logger = useLogger({ label: "ChatPage", color: "#fe7de9" });

	const { user } = useUser();

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const { toast } = useToast();

	const { createConversation, isCreatingConversation, isPending } =
		useConversations();

	const updateQueryStr = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set(name, value);

			router.replace(pathname + "?" + params.toString());
		},
		[pathname, router, searchParams]
	);

	const newChatPartnerId = searchParams.get(
		"newChatPartnerId"
	) as ChatPartnerId | null;

	const newChatPartnerInd = chatPartners.findIndex(
		(partner) => partner.id === newChatPartnerId
	);

	const newChatPartner = chatPartners[newChatPartnerInd];

	const [dialectDialogOpen, setDialectDialogOpen] = useState(false);

	const createAndOpenChat = async ({
		chatPartnerId,
		chatDialect,
	}: {
		chatPartnerId: ChatPartnerId;
		chatDialect: ArabicDialect;
	}) => {
		try {
			logger.log("Creating conversation", { chatPartnerId, chatDialect });
			const { _id } = await createConversation({
				chatPartnerId,
				chatDialect,
			});
			router.push(`/chat/${_id}?new=true`);
		} catch (error) {
			logger.error(error);
			toast({
				title: "Error creating chat",
				description:
					"An error occurred while creating a new chat, please try again later.",
				className: "error-toast",
			});
		}
	};

	const startChatHandler = async (partnerId: ChatPartnerId) => {
		const chatPartnerInd = chatPartners.findIndex(
			(partner) => partner.id === partnerId
		);

		if (chatPartnerInd === -1) {
			logger.error("Chat partner not found");
			toast({
				title: "Error starting chat",
				description:
					"An error occurred while starting a new chat, please try again later.",
				className: "error-toast",
			});
			return;
		}

		const chatPartner = chatPartners[chatPartnerInd];

		if (chatPartner.dialects.length > 1) {
			updateQueryStr("newChatPartnerId", partnerId);
			setDialectDialogOpen(true);
			return;
		}

		await createAndOpenChat({
			chatPartnerId: partnerId,
			chatDialect: chatPartner.dialects[0],
		});
	};

	const [filteredDialects, setFilteredDialects] = useState<ArabicDialect[]>(
		localStorage
			? JSON.parse(localStorage.getItem("filteredDialects") ?? "[]")
			: []
	);

	const clearDialectFilters = () => {
		setFilteredDialects([]);
		localStorage?.removeItem("filteredDialects");
	};

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

	const isPartnerFiltered = (partner: ChatPartner) =>
		filteredChatPartners.includes(partner);

	const statusIndicator = (
		<span className="relative flex h-2 w-2">
			<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
			<span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
		</span>
	);

	const chatPartnerCardsContent = sortedChatPartners.map((partner) => {
		const filtered = isPartnerFiltered(partner);
		return (
			<div
				key={partner.id}
				className={cn("relative group/card rounded-lg shadow-lg")}
			>
				<Card
					className={cn(
						"w-[300px] bg-background flex flex-col relative transition-all ease-in duration-50 h-full",
						!filtered && "opacity-40 filter blur-md"
					)}
				>
					<CardHeader>
						<ChatPartnerAvatar
							chatPartner={partner}
							classes={{
								image:
									filtered && partner.id !== "arabybuddy"
										? "mb-3 ring-2 ring-slate-300 ring-offset-4 ring-offset-slate-50group-hover/card:ring-indigo-600"
										: "mb-3",
							}}
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
					<CardContent className="flex-1 space-y-6">
						<div className="space-y-3">
							<p className="text-xs text-left text-muted-foreground tracking-tight leading-none">
								Speaks
							</p>
							<div className="flex flex-wrap gap-2">
								{partner.dialects.map((dialect) => (
									<DialectBadge dialect={dialect} key={dialect} />
								))}
							</div>
						</div>

						<div className="space-y-3">
							<p className="text-xs text-left text-muted-foreground tracking-tight leading-none">
								Ask me about
							</p>
							<div className="flex flex-wrap gap-2">
								{partner.themes.map((topic) => (
									<Badge key={topic} variant="secondary">
										{topic}
									</Badge>
								))}
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex gap-2">
						<Button
							onClick={() => startChatHandler(partner.id)}
							disabled={!filtered || isCreatingConversation || isPending}
							variant="indigo"
							size="lg"
							className="w-full"
						>
							{isCreatingConversation && <MoonLoader size={20} color="#fff" />}
							{!isCreatingConversation && <>Start Chat</>}
						</Button>
					</CardFooter>
				</Card>
				{!filtered && (
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
						<div className="flex flex-col items-center ">
							<BoltSlashIcon className="h-10 w-10 fill-slate-600 group-hover/card:fill-purple-600" />
							<Link
								href="#"
								className="font-normal text-slate-600 group-hover/card:text-purple-600 underline cursor-pointer"
							>
								Upgrade your account to unlock all dialects for this chat
								partner
							</Link>
						</div>
					</div>
				)}
			</div>
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
						key={dialect}
						pressed={filteredDialects.includes(dialect)}
						onPressedChange={(pressed: boolean) =>
							onDialectFilterChange(dialect, pressed)
						}
						asChild
					>
						<Button
							key={dialect}
							variant="ghost"
							className="font-normal rounded-none justify-start gap-1 pr-5"
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
						variant="secondary"
						className="w-full"
						onClick={clearDialectFilters}
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
		<Alert variant="purple" className="flex gap-1">
			<div>
				<BoltSlashIcon className="h-5 w-5 fill-inherit" />
			</div>
			<AlertDescription>
				You have applied dialect filters.{" "}
				<Link
					href="#"
					className="font-medium text-purple-700 underline hover:text-purple-600 cursor-pointer"
				>
					Upgrade your account to unlock all dialects for every chat partner.
				</Link>
			</AlertDescription>
		</Alert>
	);

	return (
		<div className="py-10 bg-gray-50 flex-1 max-h-screen overflow-y-scroll relative">
			<header>
				<div className="mr-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
					<div className="flex justify-between">{salutationContent}</div>
					<div className="flex flex-col sm:flex-row justify-between items-center gap-3">
						<p className="text-lg text-gray-500 max-w-4xl">
							Get started by selecting a chat partner
						</p>
						{filterContent}
					</div>
					<div className="my-4">{alertBarContent}</div>
				</div>
			</header>
			<main>
				{/* page content wrapper */}
				<div className="mr-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
					{/* chat partner cards wrapper */}
					<div className="text-center flex items-stretch justify-center md:justify-start relative flex-wrap gap-4 lg:gap-6">
						{chatPartnerCardsContent}
					</div>
				</div>
			</main>
			{newChatPartner && (
				<DialectDialog
					key={newChatPartnerId}
					open={dialectDialogOpen}
					onOpenChange={setDialectDialogOpen}
					chatPartner={newChatPartner}
					onDialectSelected={(dialect) => {
						createAndOpenChat({
							chatPartnerId: newChatPartnerId!,
							chatDialect: dialect,
						});
					}}
					isPending={isCreatingConversation}
				/>
			)}
			<SupportCard className="fixed bottom-0 right-0" />
		</div>
	);

	// const preferencesHandler = () => {
	// 	router.push("/preferences");
	// };

	// return (
	// 	<div className="text-center flex-1 flex items-center justify-center relative">
	// 		<div>
	// 			<PencilSquareIcon
	// 				className="mx-auto h-12 w-12 text-gray-400"
	// 				aria-hidden="true"
	// 			/>
	// 			<h3 className="mt-4 mb-4 text-xl font-semibold text-gray-900">
	// 				{`Hi ${user?.username ?? user?.firstName ?? ""} 👋`}
	// 			</h3>
	// 			<p className="mt-1 text-sm text-gray-500">
	// 				Get started by creating a new chat.
	// 			</p>
	// 			<div className="mt-6 flex flex-col gap-4">
	// 				<Button
	// 					type="button"
	// 					className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
	// 					// className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-8 h-11 text-center me-2 mb-2 w-full md:w-fit"
	// 					onClick={startChatHandler}
	// 					disabled={isCreatingConversation}
	// 				>
	// 					{isCreatingConversation && <MoonLoader size={20} color="#fff" />}
	// 					{!isCreatingConversation && (
	// 						<>
	// 							<PlusIcon
	// 								className="-ml-0.5 mr-1.5 h-5 w-5"
	// 								aria-hidden="true"
	// 							/>
	// 							New Chat
	// 						</>
	// 					)}
	// 				</Button>
	// 				<Button
	// 					variant="outline"
	// 					type="button"
	// 					className={cn(
	// 						"inline-flex items-center rounded-md  px-3 py-2 text-sm font-semibold shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 text-slate-600"
	// 						// "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
	// 					)}
	// 					onClick={preferencesHandler}
	// 					disabled={isCreatingConversation}
	// 					// className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-8 h-11 text-center me-2 mb-2 w-full md:w-fit"
	// 				>
	// 					<AdjustmentsHorizontalIcon
	// 						className="-ml-0.5 mr-1.5 h-5 w-5"
	// 						aria-hidden="true"
	// 					/>
	// 					Preferences
	// 				</Button>
	// 			</div>
	// 		</div>
	// 		<SupportCard className="absolute bottom-0 right-0" />
	// 	</div>
	// );
};

export default ChatPage;
