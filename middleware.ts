// MAINTAINENCE MODE *****

// import { NextResponse } from "next/server";

// export async function middleware(req: Request) {
// 	// Clone the URL
// 	const url = req.nextUrl.clone();

// 	// Get value from a redis cache
// 	const isInMaintenanceMode = api.get("...");

// 	// If is in maintenance mode, point the url pathname to the maintenance page
// 	if (isInMaintenanceMode) {
// 		url.pathname = `/maintenance`;

// 		// Rewrite to the url
// 		return NextResponse.rewrite(url);
// 	}
// }

// ********

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
	"/chat(.*)",
	"/credits(.*)",
	"/preferences(.*)",
	"/profile(.*)",
]);

export default clerkMiddleware((auth, req) => {
	if (isProtectedRoute(req)) auth().protect();
});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
