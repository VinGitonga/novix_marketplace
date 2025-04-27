import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getSlicedAddress = (address: string) => `${address.slice(0, 6)}.....${address.slice(-6)}`;

export const generateOptions = (options: string[]) => {
	return options.map((option) => {
		return { label: option, value: option };
	});
};

export function getInitials(name: string) {
	const splitName = name.trim().split(" ");

	if (splitName.length === 1) {
		return splitName[0][0].toUpperCase();
	} else {
		return (splitName[0][0] + splitName[splitName.length - 1][0]).toUpperCase();
	}
}