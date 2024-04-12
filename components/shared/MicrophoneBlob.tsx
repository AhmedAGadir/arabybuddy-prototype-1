import { cn } from "@/lib/utils";
import React, { useMemo } from "react";
import { BlobSvg } from ".";

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

	return (
		<button
			className={cn("m-auto rounded-full", !disabled && "cursor-pointer")}
			disabled={disabled}
			onClick={onClick}
		>
			<BlobSvg
				size={amplitude ? 200 + amplitude * 2 : 200}
				{...microphoneFillColor}
			/>
		</button>
	);
};

export default MicrophoneBlob;
