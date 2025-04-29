import { IAccount } from "@/types/Account";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IAuthStore {
	account: IAccount | null;
	setAccount: (account: IAccount | null) => void;
}

export const useAuthStore = create<IAuthStore>()(
	persist(
		(set) => ({
			account: null,
			setAccount(account) {
				set({ account });
			},
		}),
		{
			name: "novix-auth-storage",
		}
	)
);
