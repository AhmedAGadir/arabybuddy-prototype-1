"use client";

import { cn } from "@/lib/utils";
import {
	SignInButton,
	SignOutButton,
	SignedIn,
	SignedOut,
	UserButton,
	useUser,
} from "@clerk/nextjs";
import Image from "next/image";

import {
	AdjustmentsHorizontalIcon,
	BanknotesIcon,
	UserIcon,
	PencilSquareIcon,
	TrashIcon,
	ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { useConversations } from "@/hooks/useConversations";
import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";
import { useToast } from "../ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/20/solid";
import { Skeleton } from "@/components/ui/skeleton";
import MoonLoader from "react-spinners/MoonLoader";

const accountNavigation = [
	{
		name: "Preferences",
		href: "/preferences",
		icon: AdjustmentsHorizontalIcon,
	},
	{ name: "Buy Credits", href: "/credits", icon: BanknotesIcon },
	{ name: "Profile", href: "/profile", icon: UserIcon },
];

export default function Sidebar({ onClick }: { onClick?: () => void }) {
	const { user, isLoaded } = useUser();

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const { toast } = useToast();

	const {
		isPending,
		error,
		conversations,
		refetch,
		deleteConversation,
		createConversation,
		isCreatingConversation,
	} = useConversations();

	useEffect(() => {
		if (!isPending && error) {
			toast({
				title: "Error loading conversations",
				description: "An error occurred while loading your conversations",
				action: (
					<ToastAction altText="Try again">
						<Button variant="outline" onClick={() => refetch()}>
							Try again
						</Button>
					</ToastAction>
				),
				className: "error-toast",
				duration: Infinity,
			});
		}
	}, [isPending, error, refetch, toast]);

	const newChatHandler = useCallback(async () => {
		const data = await createConversation();
		router.push(`/chat/${data._id}`);
		onClick?.();
	}, [router, createConversation]);

	const [conversationIdToDelete, setConversationIdToDelete] =
		useState<string>();
	const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

	const openDeleteConversationDialog = (
		e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
		id: string
	) => {
		e.preventDefault();
		e.stopPropagation();
		setConversationIdToDelete(id);
		setConfirmationDialogOpen(true);
	};

	const onDeleteConversationConfirmed = async () => {
		await deleteConversation(conversationIdToDelete as string);
		setConversationIdToDelete(undefined);
		router.push("/chat");
		onClick?.();
	};

	const openConversation = useCallback(async (href: string) => {
		router.push(href);
		onClick?.();
	}, []);

	const openPage = useCallback(async (href: string) => {
		router.push(href);
		onClick?.();
	}, []);

	const conversationListContent = useMemo(() => {
		if (isPending) {
			return (
				<div className="space-y-3">
					{Array(6)
						.fill({})
						.map((_, i) => (
							<Skeleton key={i} className="h-8 min-w-[240px] w-full" />
						))}
				</div>
			);
		}

		if (error) {
			return null;
		}

		return (
			<ul role="list" className="space-y-1">
				{conversations.map(({ _id, lastMessage, label }) => {
					const isActive = `/chat/${_id}` === pathname;

					const href = isActive
						? `/chat/${_id}?${searchParams.toString()}`
						: `/chat/${_id}`;

					return (
						<li key={_id}>
							<Button
								variant="ghost"
								onClick={() => openConversation(href)}
								className={cn(
									isActive
										? "bg-secondary text-indigo-600"
										: "text-gray-700 hover:text-indigo-600 hover:bg-secondary",
									"group flex justify-between gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full"
								)}
							>
								{/* TODO: implement editable conversation labels */}
								<span onClick={(e) => openDeleteConversationDialog(e, _id)}>
									<TrashIcon
										className={cn(
											"hidden text-gray-400 group-hover:block hover:text-indigo-600",
											"h-5 w-5 shrink-0"
										)}
										aria-hidden="true"
									/>
								</span>

								<span className="truncate" style={{ direction: "rtl" }}>
									{label ?? lastMessage ?? "Untitled"}
								</span>
							</Button>
						</li>
					);
				})}
			</ul>
		);
	}, [conversations, error, isPending, pathname, searchParams]);

	const authContent = useMemo(() => {
		if (!isLoaded && user) {
			return <Skeleton className="h-8 w-full" />;
		}
		return (
			<>
				<SignedIn>
					<li className="-mx-6 lg:hidden">
						<span className="flex items-center px-5 text-sm font-semibold text-gray-900 hover:bg-secondary">
							<SignOutButton redirectUrl="/">
								<div
									className={cn(
										"text-gray-700 hover:text-indigo-600 hover:bg-secondary cursor-pointer",
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
					{/* user button doesnt work in a shadCN sheet, clicking anything inside instantly closes it, 
					the mobile buttons are just a hack for now  */}
					<li className="-mx-6 hidden lg:block">
						<span className="flex items-center gap-x-4 px-5 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-secondary">
							<UserButton afterSignOutUrl="/" />
							<span className="sr-only">Your profile</span>
							<span aria-hidden="true">
								{user?.username ?? user?.fullName ?? ""}
							</span>
						</span>
					</li>
				</SignedIn>
				<SignedOut>
					<li className="-mx-6">
						<span className="flex items-center gap-x-4 px-5 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-secondary">
							<SignInButton>
								<div
									className={cn(
										"text-gray-700 hover:text-indigo-600 hover:bg-secondary cursor-pointer",
										"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
									)}
								>
									<ArrowRightEndOnRectangleIcon
										className={cn(
											"text-gray-400 group-hover:text-indigo-600",
											"h-6 w-6 shrink-0"
										)}
										aria-hidden="true"
									/>
									Sign in
								</div>
							</SignInButton>
						</span>
					</li>
				</SignedOut>
			</>
		);
	}, [user, isLoaded]);

	const otherNavItemsContent = useMemo(() => {
		if (isPending) {
			return (
				<div className="space-y-3">
					{Array(accountNavigation.length)
						.fill({})
						.map((_, i) => (
							<Skeleton key={i} className="h-8 w-full " />
						))}
					{authContent}
				</div>
			);
		}

		return (
			<ul className="space-y-1">
				{accountNavigation.map((item) => {
					const isActive = item.href === pathname;

					return (
						<li key={item.name}>
							<Button
								variant="ghost"
								onClick={() => openPage(`${item.href}`)}
								className={cn(
									isActive
										? "bg-secondary text-indigo-600"
										: "text-gray-700 hover:text-indigo-600 hover:bg-secondary",
									"group rounded-md p-2 text-sm leading-6 font-semibold w-full justify-start"
								)}
							>
								<div className="flex items-center gap-x-3">
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
								</div>
							</Button>
						</li>
					);
				})}
				{authContent}
			</ul>
		);
	}, [authContent, pathname, isPending]);

	const newChatButtonContent = useMemo(() => {
		if (isPending) {
			return <Skeleton className="h-9 w-full bg-primary" />;
		}

		return (
			<Button
				className="flex justify-center items-center group"
				onClick={newChatHandler}
				disabled={isCreatingConversation}
			>
				{isCreatingConversation && <MoonLoader size={20} color="#fff" />}
				{!isCreatingConversation && (
					<div className="flex justify-between items-center w-full">
						<span>New Chat</span>
						<PencilSquareIcon
							className={cn(
								"text-gray-400 group-hover:text-indigo-100",
								"h-6 w-6 shrink-0"
							)}
							aria-hidden="true"
						/>
					</div>
				)}
			</Button>
		);
	}, [isPending, isCreatingConversation]);

	return (
		<aside
			className={cn(
				"flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-5 h-full"
			)}
		>
			<div className="flex p-4 shrink-0 items-center lg:pt-6">
				<Link href="/chat" className="mx-auto">
					<Image
						width={100}
						height={100}
						className="hidden lg:block"
						src="/assets/arabybuddy.svg"
						alt="ArabyBuddy logo"
					/>
				</Link>
			</div>
			<nav className="flex-1 min-h-0  flex flex-col">
				{newChatButtonContent}
				<ul role="list" className="flex-1 min-h-0 flex flex-col gap-y-7 mt-4 ">
					<li className="flex-1 overflow-y-scroll min-h-0 px-1">
						{conversationListContent}
					</li>

					<li className="mt-auto mb-3">{otherNavItemsContent}</li>
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
