import { cn } from "@/lib/utils";
import React, { useMemo } from "react";
import { BlobSvg } from ".";
import { useMediaQuery } from "@react-hooks-hub/use-media-query";

const MicrophoneBlob = ({
	onClick,
	mode,
	amplitude,
}: {
	onClick: () => void;
	mode: "recording" | "idle" | "playing" | "processing";
	amplitude: number | null;
}) => {
	const disabled = mode === "processing";

	const microphoneFillColor = useMemo(() => {
		switch (mode) {
			case "recording":
				return {
					fill: "#FF0066",
				};
			case "playing":
				return {
					fill: "#5E17EB",
				};
			case "idle":
				return {
					fill: "#38B6FF",
				};
			case "processing":
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
