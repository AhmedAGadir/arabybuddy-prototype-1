const useLogger = ({
	label,
	color,
	toggle = true,
}: {
	label: string;
	color?: string;
	toggle?: boolean;
}) => {
	const log = (message: any, message2?: any) => {
		const messageToPrint = message2 ? `${message} ${message2}` : message;
		if (toggle) {
			if (color) {
				console.log(`%c[${label}]: ${messageToPrint}`, `color: ${color}`);
				return;
			}
			console.log(`[${label}]: ${message}`);
		}
	};

	const warn = (message: any, message2?: any) => {
		const messageToPrint = message2 ? `${message} ${message2}` : message;
		if (toggle) {
			console.warn(`[${label}]: ${messageToPrint}`);
		}
	};

	const error = (...params: any) => {
		console.error(...params);
	};

	return { log, warn, error };
};

export { useLogger };
