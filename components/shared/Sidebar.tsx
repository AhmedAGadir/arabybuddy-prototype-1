"use client";

import { cn } from "@/lib/utils";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import _ from "lodash";

import {
	AdjustmentsHorizontalIcon,
	BanknotesIcon,
	UserIcon,
	PencilSquareIcon,
	TrashIcon,
	ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { useConversations } from "@/hooks/useConversations";
import SkewLoader from "react-spinners/SkewLoader";
import { useCallback, useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

const accountNavigation = [
	{
		name: "Preferences",
		href: "/preferences",
		icon: AdjustmentsHorizontalIcon,
	},
	{ name: "Buy Credits", href: "/credits", icon: BanknotesIcon },
	{ name: "Profile", href: "/profile", icon: UserIcon },
];

export default function Sidebar({
	hideLogo = false,
	logOutButton = false,
}: {
	hideLogo?: boolean;
	logOutButton?: boolean;
}) {
	const { isLoaded, user } = useUser();

	const pathname = usePathname();

	const router = useRouter();

	const newChatHandler = useCallback(async () => {
		const data = await createConversation();
		router.push(`/chat/${data._id}`);
	}, [router]);

	const {
		isPending,
		error,
		conversations,
		deleteConversation,
		createConversation,
	} = useConversations();

	const [conversationIdToDelete, setConversationIdToDelete] =
		useState<string>();
	const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

	const openDeleteConversationDialog = (
		e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
		id: string
	) => {
		e.preventDefault();
		setConversationIdToDelete(id);
		setConfirmationDialogOpen(true);
	};

	const onDeleteConversationConfirmed = async () => {
		await deleteConversation(conversationIdToDelete as string);
		setConversationIdToDelete(undefined);
		router.push("/chat");
	};

	return (
		<aside
			className={cn(
				"flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 h-full"
			)}
		>
			<div className={cn("flex p-4 shrink-0 items-center", hideLogo && "pt-6")}>
				<Link href="/chat" className="mx-auto">
					<Image
						width={100}
						height={100}
						className={cn(hideLogo && "hidden")}
						src="/assets/arabybuddy.svg"
						alt="ArabyBuddy logo"
					/>
				</Link>
			</div>
			<nav className="flex-1 min-h-0  flex flex-col">
				<Button className="flex justify-between group" onClick={newChatHandler}>
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
										// cssOverride={{ margin: "0"}}
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
												<span className="truncate" style={{ direction: "rtl" }}>
													{_.truncate(label ?? lastMessage ?? "Untitled", {
														length: 40,
													})}
												</span>
												{/* TODO: implement editable conversation labels */}
												<span
													onClick={(e) => openDeleteConversationDialog(e, _id)}
												>
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

					<li className="mt-auto mb-3">
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
								{logOutButton && (
									<li className="-mx-6">
										<span className="flex items-center px-6 text-sm font-semibold text-gray-900 hover:bg-gray-50">
											<SignOutButton redirectUrl="/">
												<div
													className={cn(
														"text-gray-700 hover:text-indigo-600 hover:bg-gray-50 cursor-pointer",
														"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
													)}
												>
													<ArrowRightStartOnRectangleIcon
														className={cn(
															"text-gray-400 group-hover:text-indigo-600",
															"h-6 w-6 shrink-0"
														)}
														aria-hidden="true"
													/>
													Sign out
												</div>
											</SignOutButton>
										</span>
									</li>
								)}
								{!logOutButton && (
									<li className="-mx-6">
										<span className="flex items-center gap-x-4 px-6 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
											<UserButton afterSignOutUrl="/" />
											<span className="sr-only">Your profile</span>
											<span aria-hidden="true">
												{user.username ?? user.fullName ?? ""}
											</span>
										</span>
									</li>
								)}
							</ul>
						)}
					</li>
				</ul>
			</nav>
			<ConfirmationDialog
				description="This action cannot be undone. This will permanently delete this conversation and all its messages from our servers."
				open={confirmationDialogOpen}
				onOpenChange={setConfirmationDialogOpen}
				onConfirm={onDeleteConversationConfirmed}
			/>
		</aside>
	);
}
