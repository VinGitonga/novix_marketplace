# Novix AI Agent Marketplace

Novix is a decentralized platform whereby user can discover, try, buy powerful AI agents in just one click as well as deploy, and monetize AI agents with seamless Web3 integration.

The marketplace simplifies AI agent management, offering natural language search,

## Inspiration 💡

The AI agent ecosystem is fragmented, with no unified platform for discovering specialized agents or deploying them in Web3 contexts.

Novix solves this by providing a decentralized hub on Hedera, easing discovery, deployment, and monetization of AI agents with low-cost.

## Features

- Natural Language Search: Find AI agents by name, summary, or topics (e.g., “fitness AI” retrieves agents like “FitCoach”)

- Agent Deployment: Deploy agents with Hedera Agent Kit SDK and topic messaging for Web3 use cases

- Agent Playground: Test AI Agents with credits before buying an AI agent

- Monetization: Creators can be able to set their agents up for sale or subscription

- Real-Time Updates: Socket.IO powers live agent interactions and marketplace updates, managed by a ConnectionManager for Hedera network connections.

- Decentralized Trust: Hedera’s HCS-10 ensures secure agent registration and discoverability, with transparent ownership and revenue tracking.

## Screenhots

- Homepage
  [![Screenshot-2025-05-02-at-03-25-03.png](https://i.postimg.cc/GtwThYM7/Screenshot-2025-05-02-at-03-25-03.png)](https://postimg.cc/r0jwfd2x)
- Agents
- [![Screenshot-2025-05-02-at-03-25-13.png](https://i.postimg.cc/DyfyQBbQ/Screenshot-2025-05-02-at-03-25-13.png)](https://postimg.cc/XXhb4KLX)
- Searched Agents
  [![Screenshot-2025-05-02-at-03-26-36.png](https://i.postimg.cc/k4xXsHcs/Screenshot-2025-05-02-at-03-26-36.png)](https://postimg.cc/47xgNBjH)
- New Agent
  [![Screenshot-2025-05-02-at-03-26-56.png](https://i.postimg.cc/90bX5qsq/Screenshot-2025-05-02-at-03-26-56.png)](https://postimg.cc/RJ3xwqSM)
- Try
[![Screenshot-2025-05-02-at-03-27-40.png](https://i.postimg.cc/m2dZmCQv/Screenshot-2025-05-02-at-03-27-40.png)](https://postimg.cc/1fqZtg7B)
-Playground
[![Screenshot-2025-05-02-at-03-34-01.png](https://i.postimg.cc/yYPqjKzW/Screenshot-2025-05-02-at-03-34-01.png)](https://postimg.cc/7ffQPphy)

## System Architecture
[![Untitled.png](https://i.postimg.cc/L5wY0pXk/Untitled.png)](https://postimg.cc/hQ8tfNVh)


# HEDERA Integration

Hedera is integrated at the core of the project such as the agent kit integration with Open AI LLM to support the chat screen.

Below as some sections

## Standard Agent KIT

```tsx
// backend-hedera/src/agent/index.ts
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
import AgentPaymentPlugin from "src/plugins/agent-payment-plugin";
import AssetSearchPlugin from "src/plugins/assets-search-plugin";

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
      // registryUrl: registryUrl,
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
    await pluginRegistry.registerPlugin(new AgentPaymentPlugin());
    await pluginRegistry.registerPlugin(new AssetSearchPlugin());
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
```

## HCS 10 Topic Messaging Usage
```tsx
// backend-hedera/src/routes/hcs-topics.ts
import { TopicId } from "@hashgraph/sdk";
import express from "express";
import { HederaAgentKit } from "hedera-agent-kit";

const router = express.Router();

const accountId = "<ACCOUNT_ID>";
const privateKey =
  "<PRIVATE_KEY>";
const publicKey =
  "<PUBLIC_KEY>";

const hederaAgentKit = new HederaAgentKit(
  accountId,
  privateKey,
  publicKey,
  "testnet"
);

router.post(
  "/create-topic-and-message",
  async (req: express.Request, res: express.Response) => {
    const { memo, message } = req.body;
    const createTopicResult = await hederaAgentKit.createTopic(memo, true);

    console.log(JSON.stringify(createTopicResult, null, 2));

    const dataRawResp = JSON.stringify(createTopicResult, null, 2);

    const rawResp = JSON.parse(dataRawResp);

    console.log("topicId", rawResp["topicId"]);

    const submitResult = await hederaAgentKit.submitTopicMessage(
      TopicId.fromString(rawResp["topicId"]),
      message
    );

    const submitResp = submitResult.getRawResponse();

    res.status(200).json({
      message: submitResp,
      createTopic: rawResp,
    });
  }
);

router.post(
  "/create-topic",
  async (req: express.Request, res: express.Response) => {
    const { memo } = req.body;

    const createTopicResult = await hederaAgentKit.createTopic(memo, true);

    const dataRawResp = JSON.stringify(createTopicResult, null, 2);

    const rawResp = JSON.parse(dataRawResp);

    res.status(200).json({ success: true, data: rawResp });
  }
);

router.post(
  "/submit-topic-message",
  async (req: express.Request, res: express.Response) => {
    const { message, topicId } = req.body;

    const submitResult = await hederaAgentKit.submitTopicMessage(
      TopicId.fromString(topicId),
      message
    );

    const submitResp = submitResult.getRawResponse();

    res.status(200).json({ success: true, data: submitResp });
  }
);

export default router;
```

### Transactions on Hedera
- Topic ID: 0.0.5940192: https://hashscan.io/testnet/topic/0.0.5940192?p=1&k=1746220019.304526000
- Transaction for Transfer: 
  - ID: 0.0.5876209@1746220005.65401447
  - Transaction URL: https://hashscan.io/testnet/transaction/1746220012.635122000

## Tech Stack

- Frontend: React, Typescript, Tailwind CSS,
- Backend: Nest JS, MongoDB(text indexing for search)
- Blockchain: Hashgraph Standard Agent Kit (NLP), Hedera Agent Kit (Topic Messaging)
- Real-Time: Socket.IO for live AI and Hedera updates
- APIs: Endpoints for agent management and web3 integrations
- Tools: ElizaOS for AI agents Playground, Winston for logging

## Installation

### Prequisites

- Git
- Yarn (1.22.19)
- Bun
- Node JS (v23)

### Process

To run the AI Agent Marketplace locally:

1. Clone the repo

```bash
git clone https://github.com/VinGitonga/novix_marketplace.git
```

2. Install Dependencies

   2.1. Backend

   ```bash
   cd backend
   ```

   Using Yarn to Install

   ```
   yarn
   ```

   Setup environment variables. Create a .env file with:

   ```txt
   MONGO_URI=<MONGO_URI>
   PORT=6534
   HEDERA_ACCOUNT_ID=<YOUR ACCOUNT ID>
   OPERATOR_ID=<YOUR OPERATOR ID>
   OPERATOR_KEY=
   PINATA_JWT=
   PINATA_GATEWAY=
   ```

   Start Backend

   ```bash
   yarn start:dev
   ```

   2.2. Hedera Backend

   ```bash
   cd backend-hedera
   ```

   Using Yarn to Install

   ```
   yarn
   ```

   Setup environment variables. Create a .env file with:

   ```txt
   HEDERA_ACCOUNT_ID=
   HEDERA_OPERATOR_ID=
   OPERATOR_ID=
   HEDERA_PRIVATE_KEY=
   HEDERA_OPERATOR_KEY=
   HEDERA_NETWORK=testnet
   REGISTRY_URL=https://moonscape.tech
   OPENAI_API_KEY=
   MONGO_URI=
   ```

   Start Hedera Backend

   ```bash
   yarn dev
   ```

   2.3. Eliza Agent Runtime

   ```bash
   cd eliza
   ```

   Using Bun to Install

   ```
   bun install
   ```

   Start Eliza

   ```bash
   elizaos dev
   ```

   2.4. Frontend

   ```bash
   cd client
   ```

   Using Yarn to Install

   ```
   bun install
   ```

   Start Frontend

   ```bash
   yarn dev
   ```

3. Open frontend url at: http://localhost:5439/

## Usage

- Access the Marketplace: Visit the local instance.
- Search for Agents: Use natural language queries (e.g., “nutrition AI”) to find agents like “FitCoach” (45 HBAR, topics: Nutrition, Gym).
- Deploy Agents: Select an agent, integrate it via Hedera Agent Kit
- Interact Live: Engage with agents through the chat Playground with Socket.IO.

## 🚧 Challenges 🚧

- Hedera Integration: Configuring HederaAgentKit for topic messaging
- Real-Time Updates: Ensuring Socket.IO stability with ConnectionManager across multiple Hedera connections was complex
- Search Optimization: Fine-tuning MongoDB text indexing for natural language queries demanded iterative testing.

## What's Next

- Add functionality for uploading and managing infrastrure for custom code
