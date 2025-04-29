import { IsString } from "class-validator";

export class RegisterAgentDto {
	@IsString()
	accountId: string;

	@IsString()
	inboundTopicId: string;
}
