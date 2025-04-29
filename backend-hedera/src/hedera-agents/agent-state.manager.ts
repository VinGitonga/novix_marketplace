import { Logger } from "@hashgraphonline/standards-sdk";
import mongoose from "mongoose";
import Agent from "src/entities/agent";
import Conversation from "src/entities/conversation";

const logger = Logger.getInstance({
  level: "info",
  module: "agent-api-server",
  prettyPrint: true,
});

class AgentStateManager {
  constructor() {
    // Connect to MongoDB when manager is initialized
    this.connectToDatabase();
  }

  private async connectToDatabase() {
    try {
      const MONGO_URI =
        process.env.MONGO_URI || "mongodb://localhost:27017/ai-agents";
      await mongoose.connect(MONGO_URI);
      logger.info("Connected to MongoDB");
    } catch (error) {
      logger.error("MongoDB connection error:", error);
      // Keep trying to connect with exponential backoff
      setTimeout(() => this.connectToDatabase(), 5000);
    }
  }

  async saveAgentState(agentId: string, state: any): Promise<boolean> {
    try {
      const agentData = {
        accountId: agentId,
        ...state,
      };

      await Agent.findOneAndUpdate({ accountId: agentId }, agentData, {
        upsert: true,
        new: true,
      });

      return true;
    } catch (error) {
      logger.error(`Failed to save agent state: ${error}`);
      return false;
    }
  }

  async loadAgentState(agentId: string): Promise<any> {
    try {
      const agent = await Agent.findOne({ accountId: agentId });
      return agent ? agent.toObject() : null;
    } catch (error) {
      logger.error(`Failed to load agent state: ${error}`);
      return null;
    }
  }

  async listAgents(): Promise<string[]> {
    try {
      const agents = await Agent.find({}, { accountId: 1 });
      return agents.map((agent) => agent.accountId);
    } catch (error) {
      logger.error(`Failed to list agents: ${error}`);
      return [];
    }
  }

  async saveConversation(
    agentId: string,
    connectionId: string,
    message: any
  ): Promise<boolean> {
    try {
      // Find or create conversation
      let conversation = await Conversation.findOne({
        agentId,
        connectionId,
      });

      if (!conversation) {
        conversation = new Conversation({
          agentId,
          connectionId,
          messages: [],
        });
      }

      // Add the new message
      conversation.messages.push({
        content: message.content,
        direction: message.direction,
        timestamp: message.timestamp || new Date(),
      });

      // Update the lastUpdated timestamp
      conversation.lastUpdated = new Date();

      await conversation.save();
      return true;
    } catch (error) {
      logger.error(`Failed to save conversation: ${error}`);
      return false;
    }
  }

  async getConversation(agentId: string, connectionId: string): Promise<any[]> {
    try {
      const conversation = await Conversation.findOne({
        agentId,
        connectionId,
      });

      return conversation ? conversation.messages : [];
    } catch (error) {
      logger.error(`Failed to get conversation: ${error}`);
      return [];
    }
  }

  async listConversations(agentId: string): Promise<string[]> {
    try {
      const conversations = await Conversation.find(
        { agentId },
        { connectionId: 1 }
      );

      return conversations.map((conv) => conv.connectionId);
    } catch (error) {
      logger.error(`Failed to list conversations: ${error}`);
      return [];
    }
  }
}

export default AgentStateManager;
