import { Body, Controller, HttpStatus, Logger, Post, Res } from "@nestjs/common";
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
}
