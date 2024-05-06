import { useRef, useState } from "react";

const useTypewriter = () => {
	const [completedTyping, setCompletedTyping] = useState(false);
	const forceCompleteRef = useRef(false);

	const typewriter = async (
		content: string,
		setTypedContent: (value: string) => void,
		delay: number
	) => {
		setCompletedTyping(false);

		let i = 0;

		while (i < content.length) {
			await new Promise((resolve) => setTimeout(resolve, delay));
			if (forceCompleteRef.current) {
				setTypedContent(content);
				forceCompleteRef.current = false;
				break;
			}
			setTypedContent(content.slice(0, i + 1));
			i++;
		}

		setCompletedTyping(true);
	};

	const completeTyping = () => {
		forceCompleteRef.current = true;
	};

	return { completeTyping, typewriter };
};

export { useTypewriter };
