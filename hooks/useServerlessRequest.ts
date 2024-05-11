import { useCallback, useRef } from "react";
import { useLogger } from "./useLogger";

const useServerlessRequest = () => {
	const logger = useLogger({ label: "useServerlessRequest", color: "#ffc600" });
	const controllerRef = useRef<AbortController>();

	const makeServerlessRequest = useCallback(async (url: string, body: any) => {
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

		return response;

		// // ** removed the code below as we sometimes stream the response a
		// // and dont want to do a .json() on it

		// const data = await response.json();
		// if (response.status !== 200) {
		// 	throw (
		// 		data.error ||
		// 		new Error(`Request failed with status ${response.status}`)
		// 	);
		// }
		// return data;
	}, []);

	const abortRequest = useCallback(() => {
		logger.log("aborting request");
		controllerRef.current?.abort();
		controllerRef.current = undefined;
	}, [logger]);

	return { makeServerlessRequest, abortRequest };
};

export { useServerlessRequest };
