// Importing the necessary module for path operations
import path from "path";

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	images: {
		domains: ["img.clerk.com"],
	},
	// reactStrictMode: false,
	webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
		// Fixes npm packages that depend on 'fs' module, but only when not on the server
		if (!isServer) {
			config.resolve.fallback = { fs: false, ...config.resolve.fallback };
		}

		// Enable WebAssembly experiments
		config.experiments = {
			...config.experiments,
			asyncWebAssembly: true,
			// Uncomment the following line if you need synchronous WebAssembly compilation
			// syncWebAssembly: true,
		};

		// Add worker-loader configuration for .worker.js files
		config.module.rules.push({
			test: /\.worker\.js$/,
			loader: "worker-loader",
			options: {
				publicPath: "/_next/static/workers/",
				filename: "static/workers/[hash].worker.js",
			},
		});

		// IMPORTANT: Return the modified config
		return config;
	},
	// async redirects() {
	// 	return [
	// 		{
	// 			source: "/((?!maintenance).*)",
	// 			destination: "/maintenance",
	// 			permanent: false,
	// 		},
	// 	];
	// },
};

export default nextConfig;
