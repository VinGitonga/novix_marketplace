import { useCallback } from "react";
import { useApi } from "./useApi";
import { IApiEndpoint } from "@/types/Api";

const useAgentsUtils = () => {
	const { post } = useApi();

	const createAgent = useCallback(
		async (data: any) => {
			const resp = await post({ endpoint: IApiEndpoint.AGENTS_CREATE, data });

			return resp.data;
		},
		[post]
	);

	return { createAgent };
};

export default useAgentsUtils;
