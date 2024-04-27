"use client";

import { roboto } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { Disclosure } from "@headlessui/react";
import Image from "next/image";
import _ from "lodash";

import {
	CalendarIcon,
	ChartPieIcon,
	DocumentDuplicateIcon,
	FolderIcon,
	HomeIcon,
	UsersIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline";

const navigation = [
	{ name: "Dashboard", href: "#", icon: HomeIcon, count: "5", current: true },
	{ name: "Team", href: "#", icon: UsersIcon, current: false },
	{
		name: "Projects",
		href: "#",
		icon: FolderIcon,
		count: "12",
		current: false,
	},
	{
		name: "Calendar",
		href: "#",
		icon: CalendarIcon,
		count: "20+",
		current: false,
	},
	{ name: "Documents", href: "#", icon: DocumentDuplicateIcon, current: false },
	{ name: "Reports", href: "#", icon: ChartPieIcon, current: false },
];
const teams = [
	{ id: 1, name: "Heroicons", href: "#", initial: "H", current: false },
	{ id: 2, name: "Tailwind Labs", href: "#", initial: "T", current: false },
	{ id: 3, name: "Workcation", href: "#", initial: "W", current: false },
];

export default function Sidebar() {
	const { isLoaded, user } = useUser();

	return (
		<aside
			className={cn(
				"flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6",
				roboto.className
			)}
		>
			<div className="flex p-4 shrink-0 items-center">
				<Image
					width={120}
					height={130}
					src="/assets/araby-buddy-with-mouth.svg"
					alt="Araby Buddy logo"
				/>
			</div>
			{isLoaded && user ? (
				<nav className="flex flex-1 flex-col">
					<ul role="list" className="flex flex-1 flex-col gap-y-7">
						<li>
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
											{item.count ? (
												<span
													className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-gray-600 ring-1 ring-inset ring-gray-200"
													aria-hidden="true"
												>
													{item.count}
												</span>
											) : null}
										</a>
									</li>
								))}
							</ul>
						</li>
						<li>
							<div className="text-xs font-semibold leading-6 text-gray-400">
								Your teams
							</div>
							<ul role="list" className="-mx-2 mt-2 space-y-1">
								{teams.map((team) => (
									<li key={team.name}>
										<a
											href={team.href}
											className={cn(
												team.current
													? "bg-gray-50 text-indigo-600"
													: "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
												"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
											)}
										>
											<span
												className={cn(
													team.current
														? "text-indigo-600 border-indigo-600"
														: "text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600",
													"flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white"
												)}
											>
												{team.initial}
											</span>
											<span className="truncate">{team.name}</span>
										</a>
									</li>
								))}
							</ul>
						</li>
						<li className="-mx-6 mt-auto">
							<a
								href="#"
								className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
							>
								<UserButton />
								<span className="sr-only">Your profile</span>
								<span aria-hidden="true">
									{_.capitalize(user.username ?? "") ?? user.fullName ?? ""}
								</span>
							</a>
						</li>
					</ul>
				</nav>
			) : (
				<div className="text-gray-700">Loading user data...</div>
			)}
		</aside>
	);
}
