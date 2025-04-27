import { Module } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { AgentController } from "./agent.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Agent, AgentSchema } from "src/entities/agent.entity";
import { HttpModule } from "@nestjs/axios";

@Module({
	imports: [MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema }]), HttpModule],
	controllers: [AgentController],
	providers: [AgentService],
	exports: [AgentService],
})
export class AgentModule {}
