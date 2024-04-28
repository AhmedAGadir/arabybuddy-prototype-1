"use client";

import { roboto } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { Disclosure } from "@headlessui/react";
import Image from "next/image";
import _ from "lodash";

import {
	AdjustmentsHorizontalIcon,
	BanknotesIcon,
	UserIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { useConversations } from "@/hooks/useConversations";
import SkewLoader from "react-spinners/SkewLoader";
import { on } from "events";
import { Icon } from "next/dist/lib/metadata/types/metadata-types";
import { IConversation } from "@/lib/database/models/conversation.model";
import { useCallback, useState } from "react";
import { PencilIcon } from "lucide-react";
import ConfirmationDialog from "./ConfirmationDialog";

// const navigation = [
// 	{ name: "Dashboard", href: "#", icon: HomeIcon, count: "5", current: true },
// 	{ name: "Team", href: "#", icon: UsersIcon, current: false },
// 	{
// 		name: "Projects",
// 		href: "#",
// 		icon: FolderIcon,
// 		count: "12",
// 		current: false,
// 	},
// 	{
// 		name: "Calendar",
// 		href: "#",
// 		icon: CalendarIcon,
// 		count: "20+",
// 		current: false,
// 	},
// 	{ name: "Documents", href: "#", icon: DocumentDuplicateIcon, current: false },
// 	{ name: "Reports", href: "#", icon: ChartPieIcon, current: false },
// ];

{
	/* <li>
						<ul role="list" className="-mx-2 space-y-1">
							{navigation.map((item) => (
								<li key={item.name}>
									<a
										href={item.href}
										className={cn(
											item.current
												? "bg-gray-50 text-indigo-600"
												: "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
											"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
										)}
									>
										<item.icon
											className={cn(
												item.current
													? "text-indigo-600"
													: "text-gray-400 group-hover:text-indigo-600",
												"h-6 w-6 shrink-0"
											)}
											aria-hidden="true"
										/>
										{item.name}
									</a>
								</li>
							))}
						</ul>
					</li> */
}

const accountNavigation = [
	{
		name: "Preferences",
		href: "/chat/preferences",
		icon: AdjustmentsHorizontalIcon,
	},
	{ name: "Buy Credits", href: "/credits", icon: BanknotesIcon },
	{ name: "Profile", href: "/profile", icon: UserIcon },
];

export default function Sidebar() {
	const { isLoaded, user } = useUser();

	const pathname = usePathname();

	const router = useRouter();

	const onConversationCreated = useCallback(
		(data: IConversation) => {
			router.push(`/chat/${data._id}`);
		},
		[router]
	);

	const onConversationDeleted = useCallback(() => {
		router.push("/chat");
	}, [router]);

	const {
		isPending,
		error,
		conversations,
		deleteConversation,
		createConversation,
	} = useConversations({ onConversationCreated, onConversationDeleted });

	console.log("{ isPending, error, conversations}", {
		isPending,
		error,
		conversations,
	});

	const [conversationIdToDelete, setConversationIdToDelete] =
		useState<string>();
	const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

	const onRemoveConversation = (
		e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
		id: string
	) => {
		e.preventDefault();
		setConversationIdToDelete(id);
		setConfirmationDialogOpen(true);
	};

	const onRemoveConversationConfirmed = () => {
		deleteConversation(conversationIdToDelete as string);
		setConversationIdToDelete(undefined);
	};

	return (
		<aside
			className={cn(
				"h-svh h-100dvh flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6"
			)}
		>
			<div className="flex p-4 shrink-0 items-center">
				<Image
					width={100}
					height={100}
					className="mx-auto"
					src="/assets/arabybuddy.svg"
					alt="ArabyBuddy logo"
				/>
			</div>
			<nav className="flex-1 min-h-0 overflow-y-hidden flex flex-col">
				<Button
					className="flex justify-between group"
					onClick={createConversation}
				>
					<span>New Chat</span>
					<PencilSquareIcon
						className={cn(
							"text-gray-400 group-hover:text-indigo-100",
							"h-6 w-6 shrink-0"
						)}
						aria-hidden="true"
					/>
				</Button>
				<ul role="list" className="flex-1 min-h-0 flex flex-col gap-y-7 mt-4 ">
					<li className="flex-1  overflow-y-scroll min-h-0">
						<ul role="list" className="space-y-1">
							{isPending && (
								<div className="text-center my-10">
									<SkewLoader
										// color="#5E17EB"
										color="black"
										loading
										cssOverride={
											{
												// margin: "0",
											}
										}
										size={10}
										aria-label="Loading Spinner"
										data-testid="loader"
									/>
								</div>
							)}
							{error && <span>Error loading conversations</span>}
							{!isPending &&
								!error &&
								conversations.map(({ _id, lastMessage, label }) => {
									const isActive = `/chat/${_id}` === pathname;
									return (
										<li key={_id}>
											<Link
												href={`/chat/${_id}`}
												className={cn(
													isActive
														? "bg-gray-50 text-indigo-600"
														: "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
													"group flex justify-between gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
												)}
											>
												{label ?? lastMessage ?? "Untitled"}
												{/* TODO: implement editable conversation labels */}
												<span onClick={(e) => onRemoveConversation(e, _id)}>
													<TrashIcon
														className={cn(
															"hidden text-gray-400 group-hover:block hover:text-indigo-600",
															"h-5 w-5 shrink-0"
														)}
														aria-hidden="true"
													/>
												</span>
											</Link>
										</li>
									);
								})}
						</ul>
					</li>

					<li className="mt-auto">
						{isLoaded && user && (
							<ul className="space-y-1">
								{accountNavigation.map((item) => {
									const isActive = item.href === pathname;

									return (
										<li key={item.name}>
											<Link
												href={item.href}
												className={cn(
													isActive
														? "bg-gray-50 text-indigo-600"
														: "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
													"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
												)}
											>
												<item.icon
													className={cn(
														isActive
															? "text-indigo-600"
															: "text-gray-400 group-hover:text-indigo-600",
														"h-6 w-6 shrink-0"
													)}
													aria-hidden="true"
												/>
												{item.name}
											</Link>
										</li>
									);
								})}
								<li className="-mx-6">
									<a
										href="#"
										className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
									>
										<UserButton afterSignOutUrl="/" />
										<span className="sr-only">Your profile</span>
										<span aria-hidden="true">
											{user.username ?? user.fullName ?? ""}
										</span>
									</a>
								</li>
							</ul>
						)}
					</li>
				</ul>
			</nav>
			<ConfirmationDialog
				description="This action cannot be undone. This will permanently delete this conversation and all its messages from our servers."
				open={confirmationDialogOpen}
				onOpenChange={setConfirmationDialogOpen}
				onConfirm={onRemoveConversationConfirmed}
			/>
		</aside>
	);
}
