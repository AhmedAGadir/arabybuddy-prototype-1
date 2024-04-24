"use client";

import { DialectProvider } from "@/context/dialectContext";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/shared/Sidebar";
import Background from "@/components/shared/Background";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<DialectProvider>
			{/* for background image to use "fill" prop, parent needs position relative */}
			<main className="relative">
				<Background />
				{children}
				<Toaster />
			</main>
		</DialectProvider>
	);
};

export default Layout;
