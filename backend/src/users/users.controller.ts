import { Body, Controller, Get, HttpStatus, Param, Post, Res } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import { AppReply } from "src/types/ApiResponse";
import { CustomBadRequestException } from "src/exceptions";

@Controller("api/users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post("create")
	async createNewUser(@Body() body: CreateUserDTO, @Res() res: AppReply) {
		try {
			const data = await this.usersService.createNewUser(body);

			return res.status(HttpStatus.CREATED).json({ status: "success", data });
		} catch (err) {
			throw new CustomBadRequestException(err.message);
		}
	}

	@Get("profile/:accountId")
	async getUserByAccountId(@Param("accountId") accountId: string, @Res() res: AppReply) {
		try {
			const data = await this.usersService.getUserByAccountId(accountId);

			return res.status(HttpStatus.OK).json({ status: "success", data });
		} catch (err) {
			throw new CustomBadRequestException();
		}
	}
}
