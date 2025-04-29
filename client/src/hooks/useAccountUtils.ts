import { useCallback } from "react";
import { useApi } from "./useApi";
import { IAccount } from "@/types/Account";
import { IApiEndpoint, IApiResponse } from "@/types/Api";

const useAccountUtils = () => {
	const { post, get } = useApi();

	const createUserAccont = useCallback(
		async (data: Omit<IAccount, "_id" | "createdAt" | "updatedAt">) => {
			const resp = await post<IApiResponse<IAccount>>({ endpoint: IApiEndpoint.ACCOUNT_CREATE, data: data });

			return resp.data;
		},
		[post]
	);

	const getAccountDetails = useCallback(
		async (accountId: string) => {
			const resp = await get<IApiResponse<IAccount>>({ endpoint: `${IApiEndpoint.ACCOUNT_GET_PROFILE}/${accountId}` as IApiEndpoint });

			return resp.data;
		},
		[get]
	);

	return { createUserAccont, getAccountDetails };
};

export default useAccountUtils;
