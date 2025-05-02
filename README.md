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
