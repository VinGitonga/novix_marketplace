import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateAgentDto {
	@IsString()
	name: string;

	@IsString()
	@IsOptional()
	username: string;

	@IsString()
	description: string;

	@IsString()
	summary: string;

	@IsArray()
	bio: string[];

	@IsString()
	prompt: string;

	@IsArray()
	topics: string[];
}
