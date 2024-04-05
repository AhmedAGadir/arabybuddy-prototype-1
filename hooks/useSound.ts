import { useEffect, useState } from "react";

const useSound = (path: string) => {
	const [sound, setSound] = useState<HTMLAudioElement | null>(null);

	useEffect(() => {
		setSound(new Audio(path));
	}, [path]);

	return sound;
};

export { useSound };
