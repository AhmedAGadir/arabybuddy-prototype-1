const useLogger = ({
	label,
	color,
	toggle = true,
}: {
	label: string;
	color?: string;
	toggle?: boolean;
}) => {
	const log = (message: string, message2?: string) => {
		const messageToPrint = message2 ? `${message} ${message2}` : message;
		if (toggle) {
			if (color) {
				console.log(`%c[${label}]: ${messageToPrint}`, `color: ${color}`);
				return;
			}
			console.log(`[${label}]: ${message}`);
		}
	};

	const warn = (message: string, message2?: string) => {
		const messageToPrint = message2 ? `${message} ${message2}` : message;
		if (toggle) {
			console.warn(`[${label}]: ${messageToPrint}`);
		}
	};

	const error = (...params: any) => {
		console.log(...params);
	};

	return { log, warn, error };
};

export { useLogger };
