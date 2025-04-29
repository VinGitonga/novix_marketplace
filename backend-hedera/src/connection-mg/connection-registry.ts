import { HCS10Client } from "@hashgraphonline/standards-sdk";
import { ConnectionManager } from "./connection";
import { logger } from "../logger/winston";
import AgentStateManager from "../hedera-agents/agent-state.manager";

export class ConnectionManagerRegistry {
  private managers: Map<string, ConnectionManager> = new Map();
  private stateManager: AgentStateManager;

  constructor() {
    this.stateManager = new AgentStateManager();
  }

  // Get or create a ConnectionManager for an agent
  async getConnectionManager(
    agentId: string,
    client: HCS10Client
  ): Promise<ConnectionManager> {
    if (this.managers.has(agentId)) {
      return this.managers.get(agentId)!;
    }

    // Load agent state to get inboundTopicId
    const agentState = await this.stateManager.loadAgentState(agentId);
    if (!agentState || !agentState.inboundTopicId) {
      throw new Error(`Agent ${agentId} not found or missing inboundTopicId`);
    }

    const manager = new ConnectionManager(client, agentState.inboundTopicId);
    // manager.startMonitoring();
    this.managers.set(agentId, manager);
    logger.info(
      `Created ConnectionManager for agent ${agentId} with topic ${agentState.inboundTopicId}`
    );
    return manager;
  }

  // Remove a ConnectionManager (e.g., when an agent is deleted)
  removeConnectionManager(agentId: string): void {
    const manager = this.managers.get(agentId);
    if (manager) {
      // Optionally stop monitoring or clean up
      this.managers.delete(agentId);
      logger.info(`Removed ConnectionManager for agent ${agentId}`);
    }
  }

  // Get all ConnectionManagers
  getAllManagers(): Map<string, ConnectionManager> {
    return this.managers;
  }
}
