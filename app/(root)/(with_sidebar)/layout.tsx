import React from "react";
import Sidebar from "@/components/shared/Sidebar";
import MobileNav from "@/components/shared/MobileNav";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex flex-col min-h-svh">
			<div className="lg:hidden sticky top-0">
				<MobileNav />
			</div>
			<div className="flex-1 flex">
				<div className="hidden h-svh w-72 lg:flex">
					<Sidebar />
				</div>
				{children}
			</div>
		</div>
	);
};

export default Layout;
