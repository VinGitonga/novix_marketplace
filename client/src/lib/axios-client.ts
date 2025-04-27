import { API_URL } from "@/env";
import { createAxiosClient } from "./create-axios-client";
// import { appAuthStore } from "@/hooks/store/useAuthStore";

const axiosClient = createAxiosClient({
	options: {
		baseURL: API_URL,
		timeout: 60000,
		headers: {
			"Content-Type": "application/json",
		},
	},
	getAuthToken: async () => {
		// // const isServer = typeof window === "undefined";

		// const userData = appAuthStore.getState().user;

		// if (!userData) {
		// 	return Promise.resolve("");
		// }

		// return userData.authToken;
		return Promise.resolve("");
	},
});

export default axiosClient;
