import { Response } from "express";

export interface ApiResponseType<T = any> {
	status: "success" | "error";
	msg?: string;
	data?: T;
}

export type AppReply<T = any> = Response<ApiResponseType<T>>;
