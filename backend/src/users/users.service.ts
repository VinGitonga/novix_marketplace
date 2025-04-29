import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/entities/user.entity";
import { CreateUserDTO } from "./dto/create-user.dto";
import { v4 } from "uuid";

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async createNewUser(body: CreateUserDTO) {
		const userExists = await this.userModel.findOne({ accountId: body.accountId });

		if (userExists) {
			throw new Error("User account exists");
		}

		const newUserAcc = await this.userModel.create({ ...body, entityId: v4() });

		return await newUserAcc.save();
	}

	async getUserByAccountId(accountId: string) {
		return await this.userModel.findOne({ accountId });
	}
}
