"use client";

import { useEffect, useMemo, useState } from "react";

const useCyclingText = (
	textArr: string[],
	interval1: number = 10000,
	interval2: number = 9000
) => {
	if (interval2 > interval1) {
		throw new Error(
			"useCyclingText - interval1 must be greater than interval2"
		);
	}

	const [showText, setShowText] = useState(false);
	const [currentInd, setCurrentInd] = useState(0);

	useEffect(() => {
		setCurrentInd(0);
		setShowText(true);

		const interval = setInterval(() => {
			setShowText(true);
			setCurrentInd((prevInd) => (prevInd + 1) % textArr.length);

			setTimeout(() => {
				setShowText(false);
			}, interval2);
		}, interval1);

		return () => clearInterval(interval);
	}, [textArr, interval1, interval2]);

	const text = useMemo(() => {
		return textArr[currentInd];
	}, [currentInd, textArr]);

	const hideText = () => setShowText(false);

	return { text, showText, hideText };
};

export { useCyclingText };
