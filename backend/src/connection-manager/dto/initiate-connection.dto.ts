import { IsString, IsOptional } from "class-validator";

export class InitiateConnectionDto {
	@IsString()
	targetInboundTopicId: string;

	@IsString()
	@IsOptional()
	memo?: string;

	@IsString()
	@IsOptional()
	initiatorInboundTopicId?: string; // Initiator's inboundTopicIdƒ
}
