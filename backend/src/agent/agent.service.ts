import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Agent } from "src/entities/agent.entity";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { createAgentDefaults, ELIZA_BASE_URL } from "src/constants";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AgentService {
	constructor(
		@InjectModel(Agent.name) private agentModel: Model<Agent>,
		private readonly httpService: HttpService,
	) {}

	async createNewAgent(infoData: CreateAgentDto) {
		const elizaData = await this.saveElizaAgent(infoData);

		if (!elizaData) {
			throw new Error(`Unable to create a new eliza agent`);
		}

		console.log("elizaData", elizaData);

		// const newAgent = await
	}

	private async saveElizaAgent(infoData: CreateAgentDto) {
		const data = {
			...infoData,
			system: infoData.prompt,
			...createAgentDefaults,
		};
		const config = {
			method: "post",
			maxBodyLength: Infinity,
			url: `${ELIZA_BASE_URL}/agents`,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			data: {
				characterPath: "string",
				characterJson: data,
			},
		};

		try {
			const observableResp = this.httpService.request<{ success: boolean; data: { character: object } }>(config);
			const resp = await firstValueFrom(observableResp);

			console.dir(resp, { depth: null });

			return resp;
		} catch (err) {
			return null;
		}
	}
}
