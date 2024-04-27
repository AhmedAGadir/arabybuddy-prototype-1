import React from "react";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import Sidebar from "@/components/shared/Sidebar";
import Menubar from "@/components/shared/Menubar";

// read all the docs here: https://clerk.com/docs/references/nextjs/current-user

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			{/* <header>
			
			</header> */}
			{/* <header>
				<nav>
					<Sheet>
						<SheetTrigger>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-6 h-6"
							>
								<path
									fillRule="evenodd"
									d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75H12a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
									clipRule="evenodd"
								/>
							</svg>
						</SheetTrigger>
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Are you absolutely sure?</SheetTitle>
								<SheetDescription>
									This action cannot be undone. This will permanently delete
									your account and remove your data from our servers.
								</SheetDescription>
							</SheetHeader>
						</SheetContent>
					</Sheet>
				</nav>
			</header> */}
			<div className="lg:hidden">
				<Menubar />
			</div>
			<main className="flex">
				<div className="hidden h-screen w-72 lg:flex">
					<Sidebar />
				</div>
				{children}
			</main>
		</>
	);
};

export default Layout;
