"use client";

import { DialectProvider } from "@/context/dialectContext";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<QueryClientProvider client={queryClient}>
			<DialectProvider>
				{children}
				<Toaster />
			</DialectProvider>
		</QueryClientProvider>
	);
};

export default Layout;
