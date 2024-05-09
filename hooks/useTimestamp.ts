import { useRef, useState } from "react";

const useTimestamp = () => {
	const [timestamp, setTimestamp] = useState<Date | null>(null);
	const timestampRef = useRef<Date | null>(null);
	timestampRef.current = timestamp;

	return { timestamp: timestampRef.current, setTimestamp };
};

export default useTimestamp;
