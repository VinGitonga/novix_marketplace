import { create } from "zustand";

interface TChatMessage {
	input: string;
	setInput: (val: string) => void;
}

export const useChatStore = create<TChatMessage>((set) => ({
	input: "",
	setInput(val) {
		set({ input: val });
	},
}));
