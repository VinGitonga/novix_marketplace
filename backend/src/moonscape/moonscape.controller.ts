import { Controller, Get, Query, All, Req } from "@nestjs/common";
import { MoonscapeService } from "./moonscape.service";
import { Request } from "express";

@Controller("api/moonscape")
export class MoonscapeController {
	constructor(private moonscapeService: MoonscapeService) {}

	@Get("registrations")
	async getRegistrations(@Req() request: Request): Promise<any> {
		const queryString = request.url.split("?")[1] || "";
		return this.moonscapeService.getRegistrations(queryString);
	}
}
