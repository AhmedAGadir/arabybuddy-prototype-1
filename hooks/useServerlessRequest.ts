const useServerlessRequest = () => {
	const controller = new AbortController();
	const { signal } = controller;

	const makeServerlessRequest = async (url: string, body: any) => {
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
				data.error || new Error(`Request failed with status ${response.status}`)
			);
		}

		return data;
	};

	const abortRequest = () => {
		controller.abort();
	};

	return { makeServerlessRequest, abortRequest };
};

export { useServerlessRequest };
