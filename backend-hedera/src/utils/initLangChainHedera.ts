import {
  HCS10Client,
  OpenConvaiState,
  PluginContext,
  PluginRegistry,
} from "@hashgraphonline/standards-agent-kit";
import {
  HEDERA_OPERATOR_ID,
  HEDERA_OPERATOR_KEY,
  OPENAI_API_KEY,
  REGISTRY_URL,
} from "../env";
import { logger } from "../logger/winston";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { ConversationTokenBufferMemory } from "langchain/memory";
import { Logger } from "@hashgraphonline/standards-sdk";
import WeatherPlugin from "../plugins/weather";
import DeFiPlugin from "../plugins/defi";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { AGENT_PERSONALITY } from "../constants/app_agent_prompt";

let hcsClient: HCS10Client;
let stateManager: OpenConvaiState;
let agentExecutor: AgentExecutor;
let memory: ConversationTokenBufferMemory;
let tools: any[] = [];

let pluginRegistry: PluginRegistry | null = null;
let pluginContext: PluginContext | null = null;

const hcsLogger = new Logger({ module: "PluginSystem" });

export async function initLangChainHedera() {
  logger.info("Initializing HCS-10 Langchain Agent ...");
  try {
    const operatorId = HEDERA_OPERATOR_ID!;
    const operatorKey = HEDERA_OPERATOR_KEY!;
    const network = "testnet";
    const openaiApiKey = OPENAI_API_KEY!;
    const registryUrl = REGISTRY_URL;

    if (!operatorId || !operatorKey) {
      throw new Error(
        "HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set in .env for initial client setup."
      );
    }
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY must be set in .env");
    }

    hcsClient = new HCS10Client(operatorId, operatorKey, network, {
      useEncryption: false,
      registryUrl: registryUrl,
    });

    stateManager = new OpenConvaiState();
    logger.info("State manager initialized with default prefix: TODD");

    tools = []; // Initialize tools here

    pluginContext = {
      client: hcsClient,
      logger: hcsLogger as any,
      config: {
        weatherApiKey: process.env.WEATHER_API_KEY,
      },
    };

    pluginRegistry = new PluginRegistry(pluginContext);

    const weatherPlugin = new WeatherPlugin();
    const defiPlugin = new DeFiPlugin();

    await pluginRegistry.registerPlugin(weatherPlugin);
    await pluginRegistry.registerPlugin(defiPlugin);

    const pluginTools = pluginRegistry.getAllTools();

    tools = [...tools, ...pluginTools];

    const llm = new ChatOpenAI({
      apiKey: openaiApiKey,
      model: "gpt-4o",
      temperature: 0,
    });

    memory = new ConversationTokenBufferMemory({
      llm,
      memoryKey: "chat_history",
      returnMessages: true,
      outputKey: "output",
      maxTokenLimit: 1000,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      "system",
      AGENT_PERSONALITY,
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = await createOpenAIToolsAgent({ llm, tools, prompt });

    agentExecutor = new AgentExecutor({ agent, tools, memory, verbose: false });

    logger.info("Langchain agent initialized");
  } catch (err) {
    logger.error("Initialization failed", { err });
    process.exit(1);
  }
}

export { agentExecutor };
