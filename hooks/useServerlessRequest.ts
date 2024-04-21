import { useCallback, useRef } from "react";
import { useLogger } from "./useLogger";

const useServerlessRequest = () => {
	const logger = useLogger({ label: "useServerlessRequest", color: "#ffc600" });
	const controllerRef = useRef<AbortController>();

	const makeServerlessRequest = useCallback(
		async (url: string, body: any) => {
			try {
				const controller = new AbortController();
				controllerRef.current = controller;
				const { signal } = controller;

				const response = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
					signal,
				});

				const data = await response.json();

				if (response.status !== 200) {
					throw (
						data.error ||
						new Error(`Request failed with status ${response.status}`)
					);
				}

				return data;
			} catch (error) {
				logger.error("Request failed", error);
				throw error;
			}
		},
		[logger]
	);

	const abortRequest = useCallback(() => {
		logger.log("aborting request");
		controllerRef.current?.abort();
		controllerRef.current = undefined;
	}, [logger]);

	return { makeServerlessRequest, abortRequest };
};

export { useServerlessRequest };
