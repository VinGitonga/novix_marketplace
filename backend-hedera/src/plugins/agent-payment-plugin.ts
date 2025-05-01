import {
  BasePlugin,
  PluginContext,
} from "@hashgraphonline/standards-agent-kit";
import { StructuredTool } from "@langchain/core/tools";
import { AgentMakePaymentTool } from "src/tools/payment-agent-tool";

export default class AgentPaymentPlugin extends BasePlugin {
  id = "ai-agent-make-payments";
  name = "Agent Plugin for Making Payments";
  description =
    "Provides the ability to make payments on behalf of a user provides with details of their Hedera Account";
  version = "0.0.1";
  author = "Dr. Sean";

  async initialize(context: PluginContext): Promise<void> {
    context.logger.info("Initing AI agent for payments plugin");
  }

  getTools(): StructuredTool[] {
    return [new AgentMakePaymentTool()];
  }
}
