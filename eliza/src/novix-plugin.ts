import type { ActionExample, Plugin } from "@elizaos/core";
import {
  type Action,
  Content,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  ModelType,
  State,
  composePromptFromState,
  parseJSONObjectFromText,
} from "@elizaos/core";
import { aiAgentMarketplaceQueryTemplate } from "./templates";
import axios from "axios";

const baseURL = `http://localhost:6534`;

async function getMarketplaceAgents(
  query: string,
  maxResults: string | number
) {
  try {
    const response = await axios.post<{
      status: "success" | "error";
      data: { results: Record<string, any>[]; count: number };
    }>(`${baseURL}/api/agents/search/by-nlp`, { query, maxResults });

    const respData = response.data;

    if (respData?.status === "success") {
      const { results, count } = respData.data;

      let result = `Found ${count} AI Agent(s):\n\n`;
      results.forEach((agent, idx) => {
        result += `Agent ${idx + 1}: ${agent.name}\n`;
        result += `Summary: ${agent.summary}\n`;
        result += `Description: ${agent.description}\n`;
        result += `Topics: ${agent.topics.join(", ")}\n`;
        result += `----------------------------------------\n\n`; // Separator for clarity
      });

      return result.trim();
    }

    return null;
  } catch (err) {
    return null;
  }
}

export const marketplaceAgents = {
  name: "NOVIX_MARKETPLACE_AGENTS",
  description: "Returns a list of agents within the marketplace",
  validate: (runtime: IAgentRuntime) => {
    return Promise.resolve(true);
  },
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    state?: State,
    _options?: { [key: string]: unknown },
    _callback?: HandlerCallback
  ) => {
    if (!state) {
      return;
    }
    const callbackData: Content = {
      text: "",
      actions: ["NOVIX_MARKETPLACE_AGENTS"],
      source: _message.content.source,
    };

    state.lastMessage = state.text;
    const prompt = composePromptFromState({
      state,
      template: aiAgentMarketplaceQueryTemplate,
    });

    let queryResult: Record<string, any> = {};

    for (let i = 0; i < 5; i++) {
      const response = await _runtime.useModel(ModelType.TEXT_SMALL, {
        prompt,
      });

      const parsedResponse = parseJSONObjectFromText(response);
      if (parsedResponse?.query && parsedResponse?.maxResults) {
        queryResult = parsedResponse;
      }
    }

    if (!queryResult) {
      console.error("Unable generate your query");
      await _runtime.createMemory(
        {
          entityId: _message.entityId,
          agentId: _message.agentId,
          roomId: _message.roomId,
          content: {
            source: _message.content.source,
            thought: "I tried to get your query but could not resolve anything",
            actions: ["NOVIX_MARKETPLACE_AGENTS"],
          },
        },
        "messages"
      );
      return;
    }

    const { query, maxResults } = queryResult;

    const agentsData = await getMarketplaceAgents(query, maxResults);

    if (!agentsData) {
      await _runtime.createMemory(
        {
          entityId: _message.entityId,
          agentId: _message.agentId,
          roomId: _message.roomId,
          content: {
            source: _message.content.source,
            thought: "No agents found",
            actions: ["NOVIX_MARKETPLACE_AGENTS"],
          },
        },
        "messages"
      );
      return;
    }

    callbackData.text = agentsData!;
    await _callback!(callbackData!);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me all AI agents with topics in Coding",
        },
      },
      {
        agent: "{{user2}}",
        content: {
          text: `Found 2 AI Agent(s):

Agent 1: CodeMaster
Summary: A coding assistant for developers
Description: Helps with debugging, code reviews, and learning new programming languages
Topics: Coding, Programming, Software Development
----------------------------------------

Agent 2: ScriptWizard
Summary: Automates scripting tasks
Description: Specializes in writing and optimizing scripts for automation
Topics: Coding, Automation, Scripting
----------------------------------------`,
          action: "NOVIX_MARKETPLACE_AGENTS",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Tell me about the AI agent CodeMaster with ID AGENT-1234, show 5 results",
        },
      },
      {
        agent: "{{user2}}",
        content: {
          text: `Found 1 AI Agent(s):

Agent 1: CodeMaster
Summary: A coding assistant for developers
Description: Helps with debugging, code reviews, and learning new programming languages
Topics: Coding, Programming, Software Development
----------------------------------------`,
          action: "NOVIX_MARKETPLACE_AGENTS",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Find AI agents with natural language processing and real-time analytics in Healthcare, limit to 20 results",
        },
      },
      {
        agent: "{{user2}}",
        content: {
          text: `Found 1 AI Agent(s):

Agent 1: HealthAdvisor
Summary: AI for healthcare insights 
Description: Provides real-time analytics and natural language processing for medical data
Topics: Healthcare, Analytics, NLP
----------------------------------------`,
          action: "NOVIX_MARKETPLACE_AGENTS",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Compare agents with names CodeMaster and HealthAdvisor",
        },
      },
      {
        agent: "{{user2}}",
        content: {
          text: `Found 2 AI Agent(s):

Agent 1: CodeMaster
Summary: A coding assistant for developers
Description: Helps with debugging, code reviews, and learning new programming languages
Topics: Coding, Programming, Software Development
----------------------------------------

Agent 2: HealthAdvisor
Summary: AI for healthcare insights
Description: Provides real-time analytics and natural language processing for medical data
Topics: Healthcare, Analytics, NLP
----------------------------------------`,
          action: "NOVIX_MARKETPLACE_AGENTS",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "What AI agents are available?",
        },
      },
      {
        agent: "{{user2}}",
        content: {
          text: `Found 3 AI Agent(s):

Agent 1: CodeMaster
Summary: A coding assistant for developers
Description: Helps with debugging, code reviews, and learning new programming languages
Topics: Coding, Programming, Software Development
----------------------------------------

Agent 2: HealthAdvisor
Summary: AI for healthcare insights
Description: Provides real-time analytics and natural language processing for medical data
Topics: Healthcare, Analytics, NLP
----------------------------------------

Agent 3: ScriptWizard
Summary: Automates scripting tasks
Description: Specializes in writing and optimizing scripts for automation
Topics: Coding, Automation, Scripting
----------------------------------------`,
          action: "NOVIX_MARKETPLACE_AGENTS",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Search for agents with prompt containing 'machine learning' and topic Finance, show 15 results",
        },
      },
      {
        agent: "{{user2}}",
        content: {
          text: `Found 1 AI Agent(s):

Agent 1: FinanceBot
Summary: Machine learning for financial predictions
Description: Uses machine learning to analyze market trends and provide insights
Topics: Finance, Machine Learning, Analytics
----------------------------------------`,
          action: "NOVIX_MARKETPLACE_AGENTS",
        },
      },
    ],
  ] as any[][],
} satisfies Action;

export const novixPlugin: Plugin = {
  name: "Novix",
  description: "Novix AI agent marketplace integration plugin",
  providers: [],
  evaluators: [],
  services: [],
  actions: [marketplaceAgents],
};
