import { IsString } from "class-validator";

export class UpdateCreditsDTO {
	@IsString()
	accountId: string;

	@IsString()
	agentId: string;

    @IsString()
    ownerId: string
}
