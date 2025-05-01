export enum RequestHeader {
	X_API_KEY = "x-api-key",
}

interface IApiSuccessResponse<T> {
	status: "success";
	msg: string;
	data?: T;
}
interface IApiErrorResponse {
	status: "error" | "failure" | "not-ready";
	msg: string;
}

export type IApiResponse<T = any> = IApiSuccessResponse<T> | IApiErrorResponse;

export const enum IApiEndpoint {
	AGENTS_CREATE = "agents/create",
	AGENTS_GET_ALL = "agents/all",
	AGENTS_GET_ELIZA_STATUS = "agents/profile/status",
	AGENTS_ELIZA_START = "agents/eliza/start",
	AGENTS_GET_DETAILS = "agents/profile/details",
	ACCOUNT_CREATE = "users/create",
	ACCOUNT_GET_PROFILE = "users/profile",
	AGENTS_CREDITS_UPDATE = "agents/credits/update",
	AGENTS_UPDATE_PRICING = "agents/update/pricing",
	AGENTS_GET_MY_AGENTS = "agents/get/my",
	AGENTS_GET_AGENT_CREDITS = "agents/credits/get",
	ASSETS_CREATE = "assets/create",
}

export interface IMethodParams {
	endpoint: IApiEndpoint;
	queryParams?: Object;
	signal?: AbortSignal;
	data?: any;
	checkAuth?: boolean;
}

export const getEndpoint = (endpoint: IApiEndpoint) => `/${endpoint}`;
