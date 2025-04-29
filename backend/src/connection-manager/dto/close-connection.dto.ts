import { IsString, IsOptional } from "class-validator";

export class CloseConnectionDto {
	@IsString()
	connectionId: string;

	@IsString()
	@IsOptional()
	reason?: string;
}
