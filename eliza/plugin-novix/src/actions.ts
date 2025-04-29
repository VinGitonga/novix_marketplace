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
    examples: [],
  } satisfies Action;
  