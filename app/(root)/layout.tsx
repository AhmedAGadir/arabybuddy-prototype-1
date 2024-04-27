"use client";

import { DialectProvider } from "@/context/dialectContext";
import React from "react";
import { Toaster } from "@/components/ui/toaster";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<DialectProvider>
			<main>
				{children}
				<Toaster />
			</main>
		</DialectProvider>
	);
};

export default Layout;
