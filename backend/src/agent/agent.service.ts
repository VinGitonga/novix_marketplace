import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Agent } from "src/entities/agent.entity";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { createAgentDefaults, ELIZA_BASE_URL, HEDERA_BACKEND_BASE_URL } from "src/constants";
import { firstValueFrom } from "rxjs";
import { UpdatePricingDTO } from "./dto/update-pricing.dto";
import { Credits } from "src/entities/credits.entity";
import { UpdateCreditsDTO } from "./dto/update-credits.dto";
import { User } from "src/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { AxiosRequestConfig } from "axios";

@Injectable()
export class AgentService {
	constructor(
		@InjectModel(Agent.name) private agentModel: Model<Agent>,
		@InjectModel(Credits.name) private creditsModel: Model<Credits>,
		private readonly httpService: HttpService,
		private readonly userService: UsersService,
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
				return resp?.data?.data.status;
			}

			return null;
		} catch (err) {
			return null;
		}
	}

	async startElizaAgent(elizaAgentId: string) {
		let config = {
			method: "post",
			maxBodyLength: Infinity,
			url: `${ELIZA_BASE_URL}/agents/${elizaAgentId}`,
			headers: {
				Accept: "application/json",
			},
		};

		try {
			const observableResp = this.httpService.request<{ success: boolean; data: { id: string; name: string; status: "active" | "inactive" } }>(config);

			const resp = await firstValueFrom(observableResp);

			if (resp?.data?.success) {
				return resp?.data?.data.status;
			}

			return null;
		} catch (err) {
			return null;
		}
	}

	async getAgentDetails(id: string) {
		return await this.agentModel.findById(id).populate("owner");
	}

	async searchAgentsByNLP(queryInfo: { query: string; maxResults: number }) {
		const { query, maxResults = 10 } = queryInfo;

		console.log(`query`, query);

		if (!query) {
			throw new Error("Query is required");
		}

		const agents = await this.agentModel
			.find({ $text: { $search: query } }, { score: { $meta: "textScore" } })
			.sort({ score: { $meta: "textScore" } })
			.limit(maxResults)
			.lean();

		return { results: agents, count: agents.length };
	}

	async addPricingDataForAgent(body: UpdatePricingDTO) {
		const { agentId, ...data } = body;

		const updatedAgentData = await this.agentModel.findByIdAndUpdate(agentId, { $set: { ...data } }, { new: true });

		// we check if we've agent data in hedera, otherwise we create it
		this.setupHederaAgentItem(agentId);

		return updatedAgentData;
	}

	private async setupHederaAgentItem(agentId: string) {
		try {
			let config = {
				method: "get",
				url: `${HEDERA_BACKEND_BASE_URL}/new-agents/get-agent/profile/${agentId}`,
				headers: {
					"Content-Type": "application/json",
				},
			};
			const hederaAgentObsResp = this.httpService.request<{ success: boolean; data: any }>(config);

			const resp = await firstValueFrom(hederaAgentObsResp);
			let agentData: any = null;

			if (resp?.data?.success) {
				agentData = resp?.data?.data;
			}

			if (agentData) {
				// we know it exists, we update metadata
				await this.agentModel.findByIdAndUpdate(agentId, { $set: { hederaAgentMetadata: agentData } });
			} else {
				const agentInfo = await this.agentModel.findById(agentId).populate("owner");
				// we create an agent
				const body = {
					name: agentInfo.name,
					description: agentInfo.description,
					agentType: "autonomous",
					capabilities: [0, 1],
					metadata: {
						creator: agentInfo?.owner?.name ?? "Novix AI",
						version: "1.0",
						properties: {
							specialization: agentInfo?.summary,
							supportedLanguages: ["en"],
						},
					},
				};

				const createConfig = {
					method: "post",
					maxBodyLength: Infinity,
					url: `${HEDERA_BACKEND_BASE_URL}/new-agents/create`,
					headers: {
						Accept: "application/json",
					},
					data: body,
				} satisfies AxiosRequestConfig;

				const createAgentObsResp = this.httpService.request<{ success: boolean; agent: { id: string; inboundTopicId: string; outboundTopicId: string; profileTopicId: string } }>(createConfig);

				const createData = await firstValueFrom(createAgentObsResp);

				if (createData?.data?.success) {
					//
					// get the newly created account;
					const newHederaAgentObs = this.httpService.request<{ success: boolean; data: any }>(config);

					const createRespInfo = await firstValueFrom(newHederaAgentObs);
					let agentData: any = null;

					if (createRespInfo?.data?.success) {
						agentData = createRespInfo?.data?.data;
					}

					if (agentData) {
						// we know it exists, we update metadata
						await this.agentModel.findByIdAndUpdate(agentId, { $set: { hederaAgentMetadata: agentData } });
					}
				}
			}
		} catch (err) {
			console.log("error", err);
		}
	}

	async updateCreditsForUser(body: UpdateCreditsDTO) {
		const { accountId, agentId, ownerId } = body;

		const existingCredits = await this.creditsModel.findOne({ accountId: accountId, agentId });
		let owner: User | null = null;

		if (ownerId) {
			owner = await this.userService.getUserById(ownerId);
		}

		if (existingCredits) {
			// we update the new credits
			const count = existingCredits.count;

			let newCount = count - 1;

			if (newCount <= 0) {
				newCount = 0;
			}

			// if owner dont decrement
			if (owner && owner.accountId === accountId) {
				return existingCredits;
			}

			return await this.creditsModel.findByIdAndUpdate(existingCredits._id, { $set: { count: newCount } });
		}

		// create new credits
		const agentDetails = await this.agentModel.findById(agentId);

		const count = agentDetails.credits;

		const newCreditsData = {
			count: count ? count - 1 : 100 - 1,
			accountId: accountId,
			agentId,
		};

		const newCredits = (await this.creditsModel.create(newCreditsData)).save();

		return newCredits;
	}

	async getAgentsByOwner(ownerId: string) {
		return await this.agentModel.find({ $or: [{ owner: ownerId }, { buyerId: ownerId }] });
	}

	async getCreditsByAccountAndAgent(accountId: string, agentId: string) {
		return await this.creditsModel.findOne({ accountId, agentId });
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
