import React from "react";

const Stop = (props: any) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-8 h-8"
			{...props}
		>
			<path
				fillRule="evenodd"
				d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm6-2.438c0-.724.588-1.312 1.313-1.312h4.874c.725 0 1.313.588 1.313 1.313v4.874c0 .725-.588 1.313-1.313 1.313H9.564a1.312 1.312 0 0 1-1.313-1.313V9.564Z"
				clipRule="evenodd"
			/>
		</svg>
	);
};

const StopButton = ({ onClick }: { onClick?: () => void }) => (
	<button type="button" onClick={onClick}>
		<div className="w-16 h-16 flex flex-row items-center gap-2 justify-center bg-red-500 rounded-full shadow-lg hover:cursor-pointer hover:drop-shadow-xl hover:bg-red-600 hover:scale-105">
			<svg
				stroke="currentColor"
				fill="currentColor"
				strokeWidth={0}
				viewBox="0 0 448 512"
				className="text-slate-200 hover:scale-125"
				height="1em"
				width="1em"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"></path>
			</svg>
		</div>
	</button>
);

export { Stop, StopButton };
