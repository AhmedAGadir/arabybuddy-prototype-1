import { cn } from "@/lib/utils";
import React, { useMemo } from "react";
import { BlobSvg } from ".";
import { useMediaQuery } from "@react-hooks-hub/use-media-query";
import { Status } from "@/app/(root)/chat/page";

const MicrophoneBlob = ({
	onClick,
	mode,
	disabled,
	amplitude,
}: {
	onClick: () => void;
	mode: Status;
	disabled?: boolean;
	amplitude: number | null;
}) => {
	const microphoneFillColor = useMemo(() => {
		switch (mode) {
			case "RECORDING":
				return {
					fill: "#FF0066",
				};
			case "PLAYING":
				return {
					fill: "#5E17EB",
				};
			case "IDLE":
				return {
					fill: "#38B6FF",
				};
			case "PROCESSING":
				return {
					fill: "#64748b",
					fillOpacity: 0.1,
				};
			default: {
				return {
					fill: "#38B6FF",
				};
			}
		}
	}, [mode]);

	const { device } = useMediaQuery();
	const isMobile = device === "mobile";

	const baseSize = isMobile ? 150 : 200;

	return (
		<button
			className={cn("m-auto rounded-full", !disabled && "cursor-pointer")}
			disabled={disabled}
			onClick={onClick}
		>
			<BlobSvg
				size={amplitude ? baseSize + amplitude * 2 : baseSize}
				{...microphoneFillColor}
			/>
		</button>
	);
};

export default MicrophoneBlob;
