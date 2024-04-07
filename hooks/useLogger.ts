const useLogger = ({
	label,
	toggle = true,
	color,
}: {
	label: string;
	toggle?: boolean;
	color?: string;
}) => {
	const log = (message: string) => {
		if (toggle) {
			if (color) {
				console.log(`%c[${label}]: ${message}`, `color: ${color}`);
				return;
			}
			console.log(`[${label}]: ${message}`);
		}
	};

	const warn = (message: string) => {
		if (toggle) {
			console.warn(`[${label}]: ${message}`);
		}
	};

	return { log, warn };
};

export { useLogger };
