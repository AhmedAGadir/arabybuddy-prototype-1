const useLogger = ({
	label,
	color,
	toggle = true,
}: {
	label: string;
	color?: string;
	toggle?: boolean;
}) => {
	const log = (...args: any[]) => {
		if (!process.env.NEXT_PUBLIC_ENABLE_LOGGING) {
			return;
		}
		if (toggle) {
			if (color) {
				// Separate string and non-string arguments
				const stringArgs = args.filter((arg) => typeof arg === "string");
				const nonStringArgs = args.filter((arg) => typeof arg !== "string");

				// Combine string arguments into a single string
				const styledMessage = stringArgs.join(" ");

				// Apply color to the combined string and log non-string arguments separately
				console.log(
					`%c[${label}]: ${styledMessage}`,
					`color: ${color}`,
					...nonStringArgs
				);
				return;
			}
			console.log(`[${label}]:`, ...args);
		}
	};

	const warn = (...args: any[]) => {
		if (!process.env.NEXT_PUBLIC_ENABLE_LOGGING) {
			return;
		}
		if (toggle) {
			if (color) {
				// Separate string and non-string arguments
				const stringArgs = args.filter((arg) => typeof arg === "string");
				const nonStringArgs = args.filter((arg) => typeof arg !== "string");

				// Combine string arguments into a single string
				const styledMessage = stringArgs.join(" ");

				// Apply color to the combined string and log non-string arguments separately
				console.warn(
					`%c[${label}]: ${styledMessage}`,
					`color: ${color}`,
					...nonStringArgs
				);
				return;
			}
			console.warn(`[${label}]:`, ...args);
		}
	};

	const error = (...params: any[]) => {
		if (!process.env.NEXT_PUBLIC_ENABLE_LOGGING) {
			return;
		}
		console.error(...params);
	};

	return { log, warn, error };
};

export { useLogger };
