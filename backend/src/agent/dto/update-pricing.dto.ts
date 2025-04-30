import { IsNumber, IsString } from "class-validator";

export class UpdatePricingDTO {
	@IsNumber()
	price: number;

	@IsNumber()
	credits: number;

	@IsNumber()
	pricingModel: number;

    @IsString()
    agentId: string;
}
