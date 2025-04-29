import {
  BasePlugin,
  PluginContext,
} from "@hashgraphonline/standards-agent-kit";
import { StructuredTool } from "@langchain/core/tools";
import { AgentSearchTool } from "src/tools/agent-search-tool";

export default class AgentSearchPlugin extends BasePlugin {
  id = "ai-agent-search";
  name = "AI Agent Search Plugin";
  description = "Provides tools to search for AI agents in the marketplace";
  version = "0.1.0";
  author = "Dr. Sean";

  async initialize(context: PluginContext): Promise<void> {
    context.logger.info("Initializing AI Agent Search Plugin");
  }

  getTools(): StructuredTool[] {
    return [new AgentSearchTool()];
  }
}
