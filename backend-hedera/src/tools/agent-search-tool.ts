import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";

interface IAgent {
  _id: string;
  name: string;
  summary: string;
  description: string;
  prompt: string;
  topics: string[];
  bio: string[];
  createdAt: string;
  price?: number;
  credits?: number;
  pricingModel?: string;
}

export class AgentSearchTool extends StructuredTool {
  name = "search_ai_tools";
  description =
    "Search for AI agents in Novix marketplace using natural language";

  schema = z.object({
    query: z
      .string()
      .describe("The natural language query to search for AI agents"),
    maxResults: z
      .number()
      .min(1)
      .max(50)
      .optional()
      .describe("Maximum number of results to return (default: 10)"),
  });

  constructor(private dbBackendUrl: string = "http://localhost:6534") {
    super();
  }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    try {
      const { query, maxResults } = input;

      const response = await axios.post<{
        status: "success" | "error";
        data: { results: IAgent[]; count: number };
      }>(`${this.dbBackendUrl}/api/agents/search/by-nlp`, {
        query,
        maxResults,
      });

      const respData = response.data;

      if (respData?.status === "success") {
        const { results, count } = respData.data;

        let result = `Found ${count} AI Agent(s):\n\n`;
        results.forEach((agent, idx) => {
          result += `Agent: ${agent.name}\n`;
          result += `AgentID: ${agent._id}\n`;
          result += `Summary: ${agent.summary}\n`;
          result += `Description: ${agent.description}\n`;
          result += `Price: ${agent?.price ?? "Free Trial"}\n`;
          result += `Credits: ${agent?.credits ?? "Free Trial"}\n`;
          result += `PricingModel: ${agent?.pricingModel ?? "Free Trials"}\n`;
          result += `Topics: ${agent.topics.join(", ")}\n`;
          result += "\n";
        });

        return result;
      }
    } catch (err) {
      return `Error searching for AI agents: ${
        err instanceof Error ? err.message : String(err)
      }`;
    }
  }
}
