import React from "react";
import Sidebar from "@/components/shared/Sidebar";
import MobileNav from "@/components/shared/MobileNav";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<div className="lg:hidden">
				<MobileNav />
			</div>
			<div className="flex">
				<div className="hidden h-screen w-72 lg:flex">
					<Sidebar />
				</div>
				{children}
			</div>
		</>
	);
};

export default Layout;
