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

		// createdAt: 1745740187623
		const recentAgent = await this.getMostRecentAgentByName(infoData.name); // Assuming 'name' is a field in CreateAgentDto

		if (!recentAgent) {
			throw new Error(`Unable to retrieve the most recent agent for name: ${infoData.name}`);
		}

		const newAgent = this.agentModel.create({
			...infoData,
			elizaId: recentAgent.id,
			elizaMetadata: recentAgent,
		});

		return (await newAgent).save();
	}

	async getAllCreatedAgents() {
		return await this.agentModel.find({});
	}

	async getElizaStatus(elizaId: string) {
		let config = {
			method: "get",
			maxBodyLength: Infinity,
			url: `${ELIZA_BASE_URL}/agents/${elizaId}`,
			headers: {
				Accept: "application/json",
			},
		};
		try {
			const observableResp = this.httpService.request<{ success: boolean; data: { id: string; name: string; status: "active" | "inactive" } }>(config);

			const resp = await firstValueFrom(observableResp);

			if (resp?.data?.success) {
				return resp?.data?.data.status
			}

			return null;
		} catch (err) {
			return null;
		}
	}

	private async getMostRecentAgentByName(name: string) {
		const agents = await this.getAllAgents(); // Fetch all agents

		// Filter agents by name and sort them by createdAt
		const filteredAgents = agents
			.filter((agent) => agent.name === name) // Assuming 'name' is a field in your agent object
			.sort((a, b) => b.createdAt - a.createdAt); // Sort by createdAt in descending order

		return filteredAgents.length > 0 ? filteredAgents[0] : null; // Return the most recent agent or null if not found
	}

	private async getAllAgents() {
		const config = {
			method: "get",
			maxBodyLength: Infinity,
			url: `${ELIZA_BASE_URL}/agents`,
			headers: {
				Accept: "application/json",
			},
		};

		try {
			const observableResp = this.httpService.request<{ success: boolean; data: { agents: Record<string, any>[] } }>(config);

			const resp = await firstValueFrom(observableResp);

			if (resp?.data?.success) {
				return resp?.data.data.agents;
			}

			return [];
		} catch (err) {
			return [];
		}
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
			const observableResp = this.httpService.request<{ success: boolean; data: { character: Record<string, any> } }>(config);
			const resp = await firstValueFrom(observableResp);

			if (resp?.data?.success) {
				return resp.data.data.character;
			}

			return null;
		} catch (err) {
			return null;
		}
	}
}
