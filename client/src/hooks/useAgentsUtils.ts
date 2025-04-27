import { useCallback } from "react";
import { useApi } from "./useApi";
import { IApiEndpoint, IApiResponse } from "@/types/Api";

const useAgentsUtils = () => {
	const { post } = useApi();

	const createAgent = useCallback(
		async (data: any) => {
			const resp = await post<IApiResponse<Record<string, any>>>({ endpoint: IApiEndpoint.AGENTS_CREATE, data });

			return resp.data;
		},
		[post]
	);

	const startElizaAgent = useCallback(
		async (elizaId: string) => {
			const resp = await post<IApiResponse<"active" | "inactive">>({ endpoint: IApiEndpoint.AGENTS_ELIZA_START, data: { elizaId } });

			return resp.data;
		},
		[post]
	);

	return { createAgent, startElizaAgent };
};

export default useAgentsUtils;
