import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MIME_TYPES } from "./constants";

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
