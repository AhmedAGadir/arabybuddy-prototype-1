import { useCallback, useRef, useState } from "react";

interface PressHandlers<T> {
	onLongPressStart: (e: React.MouseEvent<T> | React.TouchEvent<T>) => void;
	onLongPressEnd: (e: React.MouseEvent<T> | React.TouchEvent<T>) => void;
}

interface Options {
	delay?: number;
	shouldPreventDefault?: boolean;
}

export default function useLongPress<T>(
	{ onLongPressStart, onLongPressEnd }: PressHandlers<T>,
	{ delay = 300, shouldPreventDefault = true }: Options = {}
) {
	const [longPressTriggered, setLongPressTriggered] = useState(false);
	const timeout = useRef<NodeJS.Timeout | null>(null);
	const target = useRef<EventTarget | null>(null);

	const start = useCallback(
		(e: React.MouseEvent<T> | React.TouchEvent<T>) => {
			if (shouldPreventDefault && e.target) {
				e.target.addEventListener("touchend", preventDefault, {
					passive: false,
				});
				target.current = e.target;
			}
			timeout.current = setTimeout(() => {
				onLongPressStart(e);
				setLongPressTriggered(true);
			}, delay);
		},
		[onLongPressStart, delay, shouldPreventDefault]
	);

	const clear = useCallback(
		(
			e: React.MouseEvent<T> | React.TouchEvent<T>,
			shouldTriggerClick = true
		) => {
			timeout.current && clearTimeout(timeout.current);
			if (longPressTriggered) {
				onLongPressEnd(e);
			}
			setLongPressTriggered(false);
			if (shouldPreventDefault && target.current) {
				target.current.removeEventListener("touchend", preventDefault);
			}
		},
		[shouldPreventDefault, onLongPressEnd, longPressTriggered]
	);

	return {
		onMouseDown: (e: React.MouseEvent<T>) => start(e),
		onTouchStart: (e: React.TouchEvent<T>) => start(e),
		onMouseUp: (e: React.MouseEvent<T>) => clear(e),
		onMouseLeave: (e: React.MouseEvent<T>) => clear(e, false),
		onTouchEnd: (e: React.TouchEvent<T>) => clear(e),
	};
}

function preventDefault(e: Event) {
	if (!isTouchEvent(e)) return;

	if (e.touches.length < 2 && e.preventDefault) {
		e.preventDefault();
	}
}

function isTouchEvent(e: Event): e is TouchEvent {
	return e && "touches" in e;
}
