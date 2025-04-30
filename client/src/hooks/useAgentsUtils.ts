import { useCallback } from "react";
import { useApi } from "./useApi";
import { IApiEndpoint, IApiResponse } from "@/types/Api";
import { IAgent } from "@/types/Agent";

const useAgentsUtils = () => {
	const { post, put } = useApi();

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

	const updatePricingData = useCallback(
		async (price: number, credits: number, pricingModel: string, agentId: string) => {
			const resp = await put<IApiResponse<IAgent>>({ endpoint: IApiEndpoint.AGENTS_UPDATE_PRICING, data: { price, credits, pricingModel, agentId } });

			return resp.data;
		},
		[put]
	);

	const updateCreditsForUser = useCallback(
		async (accountId: string, agentId: string, ownerId: string) => {
			const resp = await put<IApiResponse<IAgent>>({ endpoint: IApiEndpoint.AGENTS_CREDITS_UPDATE, data: { accountId, agentId, ownerId } });

			return resp.data;
		},
		[put]
	);

	return { createAgent, startElizaAgent, updatePricingData, updateCreditsForUser };
};

export default useAgentsUtils;
