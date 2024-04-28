"use client";

import { Bars3BottomRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Image from "next/image";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import Link from "next/link";

export default function MobileNav() {
	return (
		<div className="min-h-full">
			<nav className="bg-white shadow-sm">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
					<div className="flex h-16 justify-between py-2">
						<div className="flex">
							<div className="flex flex-shrink-0 items-center">
								<Link href="/">
									<Image
										width={160}
										height={140}
										src="/assets/araby-horizontal-with-mouth.svg"
										alt="ArabyBuddy logo"
										className="block lg:hidden"
									/>
								</Link>
							</div>
						</div>
						<div className="flex items-center">
							<Sheet>
								<SheetTrigger>
									<div className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
										<span className="absolute -inset-0.5" />
										<span className="sr-only">Open main menu</span>
										<Bars3BottomRightIcon
											className={cn(
												"h-7 w-7 text-gray-400 group-hover:block hover:text-indigo-600"
											)}
											aria-hidden="true"
										/>
									</div>
								</SheetTrigger>
								<SheetContent className="p-0">
									<Sidebar hideLogo logOutButton />
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</nav>
		</div>
	);
}

// <div className="py-10">
// 	<header>
// 		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
// 			<h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
// 				Dashboard
// 			</h1>
// 		</div>
// 	</header>
// 	<main>
// 		<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
// 			{/* Your content */}
// 			hello world
// 		</div>
// 	</main>
// </div>;
