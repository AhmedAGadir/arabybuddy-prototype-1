import { useState } from "react";

const useTypewriter = () => {
	const [completedTyping, setCompletedTyping] = useState(false);

	const typewriter = async (
		content: string,
		setTypedContent: (value: string) => void,
		delay: number
	) => {
		setCompletedTyping(false);

		let i = 0;

		while (i < content.length) {
			await new Promise((resolve) => setTimeout(resolve, delay));
			setTypedContent(content.slice(0, i + 1));
			i++;
		}

		setCompletedTyping(true);
	};

	return { completedTyping, typewriter };
};

export { useTypewriter };
