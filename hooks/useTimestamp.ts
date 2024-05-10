import { useState } from "react";

const useTimestamp = () => {
	const [timestamp, setTimestamp] = useState<Date | null>(null);

	return { timestamp, setTimestamp };
};

export default useTimestamp;
