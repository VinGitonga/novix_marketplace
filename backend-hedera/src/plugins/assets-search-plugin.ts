import {
  BasePlugin,
  PluginContext,
} from "@hashgraphonline/standards-agent-kit";
import { StructuredTool } from "@langchain/core/tools";
import { AssetSearchTool } from "src/tools/asset-search-tool";

export default class AssetSearchPlugin extends BasePlugin {
  id = "ai-asset-search";
  name = "AI Asset Search Plugin";
  description =
    "Provides tools to search for AI models and datasets in the marketplace";
  version = "0.1.0";
  author = "Dr. Sean";

  async initialize(context: PluginContext): Promise<void> {
    context.logger.info("Initializing AI Asset Search Plugin");
  }

  getTools(): StructuredTool[] {
    return [new AssetSearchTool()];
  }
}
