// import { useState, useRef } from "react";

// export default function useLongPress(callback: () => void, ms = 500) {
// 	const [action, setAction] = useState();
// 	const timerRef = useRef<any>();
// 	const isLongPress = useRef<boolean>(false);

// 	function startPressTimer() {
// 		isLongPress.current = false;
// 		timerRef.current = setTimeout(() => {
// 			isLongPress.current = true;
// 			setAction("longpress");
// 			callback();
// 		}, ms);
// 	}

// 	function handleOnClick(e) {
// 		if (isLongPress.current) {
// 			return;
// 		}
// 		setAction("click");
// 	}

// 	function handleOnMouseDown() {
// 		startPressTimer();
// 	}

// 	function handleOnMouseUp() {
// 		clearTimeout(timerRef.current);
// 	}

// 	function handleOnTouchStart() {
// 		startPressTimer();
// 	}

// 	function handleOnTouchEnd() {
// 		if (action === "longpress") return;
// 		clearTimeout(timerRef.current);
// 	}

// 	return {
// 		action,
// 		handlers: {
// 			onClick: handleOnClick,
// 			onMouseDown: handleOnMouseDown,
// 			onMouseUp: handleOnMouseUp,
// 			onTouchStart: handleOnTouchStart,
// 			onTouchEnd: handleOnTouchEnd,
// 		},
// 	};
// }
