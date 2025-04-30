import { Module } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { AgentController } from "./agent.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Agent, AgentSchema } from "src/entities/agent.entity";
import { HttpModule } from "@nestjs/axios";
import { Credits, CreditsSchema } from "src/entities/credits.entity";
import { UsersModule } from "src/users/users.module";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Agent.name, schema: AgentSchema },
			{ name: Credits.name, schema: CreditsSchema },
		]),
		HttpModule,
		UsersModule
	],
	controllers: [AgentController],
	providers: [AgentService],
	exports: [AgentService],
})
export class AgentModule {}
