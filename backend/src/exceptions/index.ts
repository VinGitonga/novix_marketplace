import { BadRequestException } from "@nestjs/common";

/**
 * Custom Bad Request exception with error status and message
 */
export class CustomBadRequestException extends BadRequestException {
	constructor(message?: string, data?: any) {
		super({
			status: "error",
			msg: message ?? "An error was encountered",
			data,
		});
	}
}
