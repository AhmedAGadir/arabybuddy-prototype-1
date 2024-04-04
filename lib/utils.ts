import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isDefined = <T>(value: T | undefined): value is T =>
	value !== undefined;

export const isNotNull = <T>(value: T | null): value is T => value !== null;
