import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MIME_TYPES } from "./constants";
import internal from "stream";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isDefined = <T>(value: T | undefined): value is T =>
	value !== undefined;

export const isNotNull = <T>(value: T | null): value is T => value !== null;

export const getFirstSupportedMimeType = () => {
	for (const mimeType of MIME_TYPES) {
		if (MediaRecorder.isTypeSupported(mimeType)) {
			return mimeType;
		}
	}
	throw new Error("No supported MIME type found");
	return "";
};

// next js complains about window and navigator being undefined
declare global {
	interface Window {}
	interface Navigator {}
}
export const iOS = () => {
	if (typeof window !== "undefined") {
		return (
			[
				"iPad Simulator",
				"iPhone Simulator",
				"iPod Simulator",
				"iPad",
				"iPhone",
				"iPod",
			].includes(navigator.platform) ||
			// iPad on iOS 13 detection
			(navigator.userAgent.includes("Mac") && "ontouchend" in document)
		);
	}
	return false;
};

export async function streamToBase64(readableStream: internal.Stream) {
	return new Promise((resolve, reject) => {
		const chunks: any[] = [];
		readableStream.on("data", (chunk) => chunks.push(chunk));
		readableStream.on("error", reject);
		readableStream.on("end", () => {
			const buffer = Buffer.concat(chunks);
			const base64 = buffer.toString("base64");
			resolve(base64);
		});
	});
}

export const blobToBase64 = async (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = function () {
			const base64data = (reader?.result as string).split(",")[1];
			resolve(base64data);
		};
		reader.onerror = reject; // Handle errors
		reader.readAsDataURL(blob);
	});
};

export const base64ToBlob = (base64: string, type: string): Blob => {
	const byteCharacters = atob(base64);
	const byteNumbers = new Array(byteCharacters.length);
	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i);
	}
	const byteArray = new Uint8Array(byteNumbers);
	return new Blob([byteArray], { type });
};
