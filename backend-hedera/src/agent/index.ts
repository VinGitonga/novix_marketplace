import dotenv from "dotenv";
import {
  IStateManager,
  ConnectionTool,
  ConnectionMonitorTool,
  ListConnectionsTool,
  InitiateConnectionTool,
  SendMessageToConnectionTool,
  CheckMessagesTool,
  ManageConnectionRequestsTool,
  AcceptConnectionRequestTool,
  RegisterAgentTool,
  PluginRegistry,
  PluginContext,
  HbarPricePlugin,
  HCS10Client,
  OpenConvaiState,
  RetrieveProfileTool,
  FindRegistrationsTool,
  SendMessageTool,
} from "@hashgraphonline/standards-agent-kit";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { ConversationTokenBufferMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StructuredToolInterface } from "@langchain/core/tools";
import WeatherPlugin from "../plugins/weather";
import DeFiPlugin from "../plugins/defi";
import { AgentIdentity } from "../types/Agent";

import { Logger } from "@hashgraphonline/standards-sdk";
import { AGENT_PERSONALITY } from "../constants/app_agent_prompt";
import AgentSearchPlugin from "src/plugins/agent-search-plugin";

dotenv.config();

let hcsClient: HCS10Client;
let stateManager: IStateManager;
let agentExecutor: AgentExecutor;
let memory: ConversationTokenBufferMemory;
let connectionMonitor: ConnectionTool | null = null;
let connectionMonitorTool: ConnectionMonitorTool | null = null;
let tools: StructuredToolInterface[] = [];
let pluginRegistry: PluginRegistry | null = null;
let pluginContext: PluginContext | null = null;

async function loadAgentFromEnv(prefix: string): Promise<AgentIdentity | null> {
  const accountId = process.env[`${prefix}_ACCOUNT_ID`];
  const privateKey = process.env[`${prefix}_PRIVATE_KEY`];
  const inboundTopicId = process.env[`${prefix}_INBOUND_TOPIC_ID`];
  const outboundTopicId = process.env[`${prefix}_OUTBOUND_TOPIC_ID`];
  const profileTopicId = process.env[`${prefix}_PROFILE_TOPIC_ID`];

  if (!accountId || !privateKey || !inboundTopicId || !outboundTopicId) {
    console.log(`Incomplete agent details for prefix ${prefix}, skipping.`);
    return null;
  }

  return {
    name: `${prefix} Agent`,
    accountId,
    privateKey,
    inboundTopicId,
    outboundTopicId,
    profileTopicId,
  };
}

async function initializeAgent() {
  console.log("Initializing HCS-10 LangChain Agent...");
  try {
    // Load environment variables
    const operatorId = process.env.HEDERA_OPERATOR_ID!;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY!;
    const network = process.env.HEDERA_NETWORK || "testnet";
    const openaiApiKey = process.env.OPENAI_API_KEY!;
    const registryUrl = process.env.REGISTRY_URL;

    if (!operatorId || !operatorKey || !openaiApiKey) {
      throw new Error("Required environment variables are missing.");
    }

    // Initialize HCS client
    hcsClient = new HCS10Client(operatorId, operatorKey, "testnet", {
      useEncryption: false,
      registryUrl: registryUrl,
    });

    const monitoringHcsClient = new HCS10Client(
      operatorId,
      operatorKey,
      "testnet",
      {
        useEncryption: false,
        registryUrl: registryUrl,
        logLevel: "error",
      }
    );

    // Initialize state manager
    stateManager = new OpenConvaiState();
    stateManager.initializeConnectionsManager(hcsClient.standardClient);

    // Load agents
    const knownPrefixes = (process.env.KNOWN_AGENT_PREFIXES || "TODD")
      .split(",")
      .map((p) => p.trim());
    const loadedAgents: AgentIdentity[] = [];
    for (const prefix of knownPrefixes) {
      const agent = await loadAgentFromEnv(prefix);
      if (agent) loadedAgents.push(agent);
    }

    // Select first agent (or implement selection logic)
    const selectedAgent = loadedAgents[0];
    if (selectedAgent) {
      hcsClient.setClient(selectedAgent.accountId, selectedAgent.privateKey);
      monitoringHcsClient.setClient(
        selectedAgent.accountId,
        selectedAgent.privateKey
      );
      stateManager.setCurrentAgent({
        name: selectedAgent.name,
        accountId: selectedAgent.accountId,
        inboundTopicId: selectedAgent.inboundTopicId,
        outboundTopicId: selectedAgent.outboundTopicId,
        profileTopicId: selectedAgent.profileTopicId,
      });
      stateManager.initializeConnectionsManager(hcsClient.standardClient);
    }

    // Initialize tools
    tools = [
      new RegisterAgentTool(hcsClient as HCS10Client),
      // new FindRegistrationsTool({ hcsClient: hcsClient as HCS10Client }),
      new InitiateConnectionTool({
        hcsClient: hcsClient as HCS10Client,
        stateManager,
      }),
      new ListConnectionsTool({
        hcsClient: hcsClient as HCS10Client,
        stateManager,
      }),
      new SendMessageToConnectionTool({
        hcsClient: hcsClient as HCS10Client,
        stateManager,
      }),
      new CheckMessagesTool({
        hcsClient: hcsClient as HCS10Client,
        stateManager,
      }),
      new SendMessageTool(hcsClient as HCS10Client),
      new ConnectionTool({
        client: monitoringHcsClient as HCS10Client,
        stateManager,
      }),
      new ConnectionMonitorTool({
        hcsClient: monitoringHcsClient as HCS10Client,
        stateManager,
      }),
      new ManageConnectionRequestsTool({
        hcsClient: hcsClient as HCS10Client,
        stateManager,
      }),
      new AcceptConnectionRequestTool({
        hcsClient: hcsClient as HCS10Client,
        stateManager,
      }),
      new RetrieveProfileTool(hcsClient as HCS10Client),
    ];

    connectionMonitor = tools.find(
      (tool) => tool instanceof ConnectionTool
    ) as ConnectionTool | null;
    connectionMonitorTool = tools.find(
      (tool) => tool instanceof ConnectionMonitorTool
    ) as ConnectionMonitorTool | null;

    // Initialize plugin system
    pluginContext = {
      client: hcsClient,
      logger: new Logger({ module: "PluginSystem" }) as any,
      config: { weatherApiKey: process.env.WEATHER_API_KEY },
    };
    pluginRegistry = new PluginRegistry(pluginContext);
    await pluginRegistry.registerPlugin(new WeatherPlugin());
    await pluginRegistry.registerPlugin(new DeFiPlugin());
    await pluginRegistry.registerPlugin(new HbarPricePlugin());
    await pluginRegistry.registerPlugin(new AgentSearchPlugin());
    const pluginTools = pluginRegistry.getAllTools();
    tools = [...tools, ...pluginTools];

    // Initialize LangChain components
    const llm = new ChatOpenAI({
      apiKey: openaiApiKey,
      modelName: "gpt-4o",
      temperature: 0,
    });

    memory = new ConversationTokenBufferMemory({
      llm,
      memoryKey: "chat_history",
      returnMessages: true,
      outputKey: "output",
      maxTokenLimit: 1000,
      inputKey: "input",
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", AGENT_PERSONALITY],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = await createOpenAIToolsAgent({ llm, tools, prompt });
    agentExecutor = new AgentExecutor({ agent, tools, memory, verbose: false });

    // Start monitoring
    await runMonitoring();
  } catch (error) {
    console.error("Initialization failed:", error);
    throw error;
  }
}

async function runMonitoring(): Promise<void> {
  const monitoringPromises: Promise<unknown>[] = [];
  if (connectionMonitor) {
    const monitorPromise = connectionMonitor.invoke({});
    monitoringPromises.push(monitorPromise);
    monitorPromise.catch((err) => console.error("ConnectionTool error:", err));
  }
  if (connectionMonitorTool) {
    const toolMonitorPromise = connectionMonitorTool.invoke({
      monitorDurationSeconds: 300,
      acceptAll: false,
    });
    monitoringPromises.push(toolMonitorPromise);
    toolMonitorPromise.catch((err) =>
      console.error("ConnectionMonitorTool error:", err)
    );
  }
  await Promise.allSettled(monitoringPromises);
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

async function chat(input: string): Promise<string> {
  try {
    const result = await agentExecutor.invoke({ input });
    return result.output;
  } catch (error) {
    console.error("Error during agent execution:", error);
    throw new Error("Failed to process request");
  }
}

export { initializeAgent, chat, agentExecutor };
