import { Body, Controller, Get, HttpStatus, Logger, Param, Post, Res } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { AppReply } from "src/types/ApiResponse";
import { CustomBadRequestException } from "src/exceptions";

@Controller("api/agents")
export class AgentController {
	private readonly logger = new Logger(AgentController.name);
	constructor(private readonly agentService: AgentService) {}

	@Post("create")
	async createAgent(@Body() body: CreateAgentDto, @Res() res: AppReply) {
		try {
			await this.agentService.createNewAgent(body);

			return res.status(HttpStatus.CREATED).json({ status: "success", msg: "Created an Agent" });
		} catch (err) {
			throw new CustomBadRequestException();
		}
	}

	@Get("all")
	async getAllCreatedAgents(@Res() res: AppReply) {
		try {
			const allAgents = await this.agentService.getAllCreatedAgents();

			return res.status(HttpStatus.OK).json({ status: "success", data: allAgents });
		} catch (err) {
			throw new CustomBadRequestException(err?.message);
		}
	}

	@Get("profile/status/:elizaId")
	async getElizaAgentStatus(@Param("elizaId") elizaId: string, @Res() res: AppReply) {
		try {
			const data = await this.agentService.getElizaStatus(elizaId);

			return res.status(HttpStatus.OK).json({ status: "success", data });
		} catch (err) {
			throw new CustomBadRequestException();
		}
	}

	@Post("eliza/start")
	async startElizaAgent(@Body() body: { elizaId: string }, @Res() res: AppReply<string>) {
		try {
			const data = await this.agentService.startElizaAgent(body.elizaId);

			return res.status(HttpStatus.OK).json({ status: "success", data });
		} catch (err) {
			throw new CustomBadRequestException();
		}
	}

	@Get("profile/details/:id")
	async getAgentDetails(@Param("id") id: string, @Res() res: AppReply) {
		try {
			const data = await this.agentService.getAgentDetails(id);

			return res.status(HttpStatus.OK).json({ status: "success", data });
		} catch (err) {
			throw new CustomBadRequestException();
		}
	}

	@Post("search/by-nlp")
	async searchAgentsByNLP(@Body() body: { query: string; maxResults: number }, @Res() res: AppReply) {
		try {
			const agents = await this.agentService.searchAgentsByNLP(body);

			return res.status(HttpStatus.OK).json({ status: "success", data: agents });
		} catch (err) {
			throw new CustomBadRequestException();
		}
	}
}
