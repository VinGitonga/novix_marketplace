import { useCallback } from "react";
import { useApi } from "./useApi";
import { IMetadata } from "@/types/Asset";
import { IApiEndpoint, IApiResponse } from "@/types/Api";

const useAssetData = () => {
	const { post } = useApi();

	const createNewAsset = useCallback(
		async (data: IMetadata) => {
			const resp = await post<IApiResponse<any>>({ endpoint: IApiEndpoint.ASSETS_CREATE, data });

			return resp.data;
		},
		[post]
	);

	return { createNewAsset };
};

export default useAssetData;
