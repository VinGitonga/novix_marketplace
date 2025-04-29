import { API_URL } from "@/env";
import { RegistrationsApiResponse, RegistrationSearchOptions, RegistrationSearchResult } from "@hashgraphonline/standards-sdk";

const useHCSUtils = () => {
	/**
	 * Finds registrations based on the provided options.
	 *
	 * @param options - The options for searching registrations.
	 * @param baseUrl - The base URL of the guarded registry.
	 * @returns A promise that resolves to the registration search result.
	 */
	const findRegistrations = async (options: RegistrationSearchOptions = {}, baseUrl: string = "https://moonscape.tech"): Promise<RegistrationSearchResult> => {
		try {
			const queryParams = new URLSearchParams();
			options.tags?.forEach((tag) => queryParams.append("tags", tag));
			if (options.accountId) {
				queryParams.append("accountId", options.accountId);
			}
			if (options.network) {
				queryParams.append("network", options.network);
			}

			const response = await fetch(`${API_URL}/moonscape/registrations?${queryParams}`, {
				headers: {
					Accept: "*/*",
					"Accept-Language": "en;q=0.5",
					// Origin: baseUrl,
					// Referer: `${baseUrl}/`,
				},
			});

			if (!response.ok) {
				const error = await response.text();
				return {
					registrations: [],
					error: error || "Failed to fetch registrations",
					success: false,
				};
			}

			const data = (await response.json()) as RegistrationsApiResponse;
			if (data.error) {
				return {
					registrations: [],
					error: data.error,
					success: false,
				};
			}

			return {
				registrations: data.registrations || [],
				success: true,
			};
		} catch (e) {
			const error = e as Error;
			return {
				registrations: [],
				error: `Error fetching registrations: ${error.message}`,
				success: false,
			};
		}
	};

	return { findRegistrations };
};

export default useHCSUtils;
