import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { AxiosRequestConfig } from "axios";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class MoonscapeService {
	constructor(private httpService: HttpService) {}

	async getRegistrations(queryParams: string): Promise<any> {
		const url = `https://moonscape.tech/api/registrations${queryParams ? "?" + queryParams : ""}`;

		const config: AxiosRequestConfig = {
			headers: {
				Accept: "*/*",
				"Accept-Language": "en;q=0.5",
				Origin: "https://moonscape.tech",
				Referer: "https://moonscape.tech/",
			},
		};

		try {
			const response = await firstValueFrom(this.httpService.get(url, config));
			return (response as any)?.data;
		} catch (error) {
			throw error.response?.data || error.message;
		}
	}
}
