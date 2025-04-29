import { IsString } from "class-validator";

export class CreateUserDTO {
	@IsString()
	name: string;
	@IsString()
	username: string;
	@IsString()
	accountId: string;
}
