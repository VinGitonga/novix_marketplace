import express from "express";
import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import {
  HCS10Client,
  AgentBuilder,
  AIAgentCapability,
  Logger,
} from "@hashgraphonline/standards-sdk";
import AgentStateManager from "../hedera-agents/agent-state.manager";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG and GIF files are allowed."
        )
      );
    }
  },
});

// Initialize logger
const logger = Logger.getInstance({
  level: "info",
  module: "agent-api-server",
  prettyPrint: true,
});

// Initialize state manager
const stateManager = new AgentStateManager();

// Helper function to create a client from environment or specific agent credentials
async function createClient(agentId?: string): Promise<HCS10Client> {
  if (agentId) {
    const state = await stateManager.loadAgentState(agentId);
    if (state && state.privateKey) {
      return new HCS10Client({
        network: state.network || "testnet",
        operatorId: agentId,
        operatorPrivateKey: state.privateKey,
        logLevel: "info",
      });
    }
  }

  // Default client from environment variables
  return new HCS10Client({
    network: "testnet",
    operatorId: process.env.HEDERA_ACCOUNT_ID!,
    operatorPrivateKey: process.env.HEDERA_PRIVATE_KEY!,
    logLevel: "info",
  });
}

/**
 * Create a basic AI agent
 */
async function createBasicAgent(
  client: HCS10Client,
  agentInfo: {
    name: string;
    description: string;
    agentType: "manual" | "autonomous";
    model?: string;
    capabilities?: AIAgentCapability[];
    metadata?: any;
  }
): Promise<any> {
  try {
    logger.info("Creating a new AI agent");

    const {
      name,
      description,
      agentType,
      model = "gpt-4",
      capabilities = [
        AIAgentCapability.TEXT_GENERATION,
        AIAgentCapability.KNOWLEDGE_RETRIEVAL,
      ],
      metadata = {
        creator: "API User",
        version: "1.0",
        properties: {
          specialization: "custom agent",
          supportedLanguages: ["en"],
        },
      },
    } = agentInfo;

    // Configure the agent
    const agentBuilder = new AgentBuilder()
      .setName(name)
      .setBio(description)
      .setType(agentType)
      .setModel(model)
      .setNetwork("testnet") // Must match client network
      .setCapabilities([
        AIAgentCapability.TEXT_GENERATION,
        AIAgentCapability.KNOWLEDGE_RETRIEVAL
      ])
      .setMetadata(metadata);

    // Create and register the agent
    const result = await client.createAndRegisterAgent(agentBuilder, {
      progressCallback: (progress) => {
        logger.info(`${progress.stage}: ${progress.progressPercent}%`);
      },
    });

    console.log("result", result)

    if (result.success) {
      logger.info(`Agent created with ID: ${result.metadata?.accountId}`);

      // Store credentials and agent info
      const agentData = {
        accountId: result.metadata?.accountId,
        privateKey: result.metadata?.privateKey,
        inboundTopicId: result.metadata?.inboundTopicId,
        outboundTopicId: result.metadata?.outboundTopicId,
        profileTopicId: result.metadata?.profileTopicId,
        network: "testnet",
        created: new Date(),
        name,
        description,
        metadata,
      };

      // Save the agent data
      if (result.metadata?.accountId) {
        await stateManager.saveAgentState(result.metadata.accountId, agentData);
      }

      return result;
    } else {
      logger.error(`Failed to create agent: ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.log("error000000", error)
    logger.error("Failed to create agent:", error);
    return { success: false, error: error.message };
  }
}

// API ROUTES

// Get all agents
router.get("/", async (req: Request, res: Response) => {
  try {
    const agents = await stateManager.listAgents();

    // Get details for each agent
    const agentDetailsPromises = agents.map(async (agentId) => {
      const state = await stateManager.loadAgentState(agentId);
      // Return public details only (not private keys)
      return {
        id: agentId,
        name: state.name,
        description: state.description,
        created: state.created,
        inboundTopicId: state.inboundTopicId,
        outboundTopicId: state.outboundTopicId,
        profileTopicId: state.profileTopicId,
        pfpTopicId: state.pfpTopicId,
        network: state.network || "testnet",
      };
    });

    const agentDetails = await Promise.all(agentDetailsPromises);
    res.json({ success: true, agents: agentDetails });
  } catch (error: any) {
    logger.error("Error listing agents:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get agent details
router.get("/details/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const agentState = await stateManager.loadAgentState(agentId);

    if (!agentState) {
      res.status(404).json({ success: false, error: "Agent not found" });
    }

    // Return public details only
    const agentDetails = {
      id: agentId,
      name: agentState.name,
      description: agentState.description,
      created: agentState.created,
      inboundTopicId: agentState.inboundTopicId,
      outboundTopicId: agentState.outboundTopicId,
      profileTopicId: agentState.profileTopicId,
      pfpTopicId: agentState.pfpTopicId,
      network: agentState.network || "testnet",
      metadata: agentState.metadata || {},
    };

    res.json({ success: true, agent: agentDetails });
  } catch (error: any) {
    logger.error(`Error getting agent ${req.params.agentId}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new agent
router.post("/create", async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      agentType = "manual",
      model = "gpt-4",
      capabilities = [
        AIAgentCapability.TEXT_GENERATION,
        AIAgentCapability.KNOWLEDGE_RETRIEVAL,
      ],
      metadata = {},
    } = req.body;

    // Validate required fields
    if (!name || !description) {
      res.status(400).json({
        success: false,
        error: "Name and description are required",
      });
    }

    const client = await createClient();
    const result = await createBasicAgent(client, {
      name,
      description,
      agentType: agentType as "manual" | "autonomous",
      model,
      capabilities,
      metadata,
    });

    if (result.success) {
      // Return public details only
      const agentDetails = {
        id: result.metadata?.accountId,
        inboundTopicId: result.metadata?.inboundTopicId,
        outboundTopicId: result.metadata?.outboundTopicId,
        profileTopicId: result.metadata?.profileTopicId,
      };

      res.status(201).json({ success: true, agent: agentDetails });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    logger.error("Error creating agent:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add profile image to an agent
router.post(
  "/update-profile/:agentId/profile-image",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { agentId } = req.params;
      const file = req.file;

      if (!file) {
        res
          .status(400)
          .json({ success: false, error: "No image file provided" });
      }

      const agentState = await stateManager.loadAgentState(agentId);
      if (!agentState) {
        res.status(404).json({ success: false, error: "Agent not found" });
      }

      const client = await createClient(agentId);

      // Read the uploaded file
      const imageBuffer = fs.readFileSync(file.path);
      const fileName = file.originalname;

      // Inscribe the image
      const result = await client.inscribePfp(imageBuffer, fileName);

      // Clean up the uploaded file
      fs.unlinkSync(file.path);

      if (result.success) {
        // Update agent state with new PFP topic ID
        agentState.pfpTopicId = result.pfpTopicId;
        await stateManager.saveAgentState(agentId, agentState);

        res.json({
          success: true,
          pfpTopicId: result.pfpTopicId,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      logger.error(
        `Error adding profile image to agent ${req.params.agentId}:`,
        error
      );
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Update agent profile
router.put("/update-agent-profile/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { name, description, capabilities = [], metadata = {} } = req.body;

    // Validate required fields
    if (!name || !description) {
      res.status(400).json({
        success: false,
        error: "Name and description are required",
      });
    }

    const agentState = await stateManager.loadAgentState(agentId);
    if (!agentState) {
      res.status(404).json({ success: false, error: "Agent not found" });
    }

    const client = await createClient(agentId);

    const result = await client.storeHCS11Profile(
      name,
      description,
      agentState.inboundTopicId,
      agentState.outboundTopicId,
      capabilities,
      metadata,
      undefined, // No new image
      undefined, // No new filename
      agentState.pfpTopicId // Existing profile image topic
    );

    if (result.success) {
      // Update agent data in database
      agentState.name = name;
      agentState.description = description;
      agentState.metadata = metadata;

      // Update the profileTopicId if it changed
      if (result.profileTopicId !== agentState.profileTopicId) {
        agentState.profileTopicId = result.profileTopicId;
      }

      await stateManager.saveAgentState(agentId, agentState);

      res.json({ success: true, pfpTopicId: result.pfpTopicId });
    }
  } catch (err) {}
});

// Get all conversations for an agent
router.get(
  "/conversationa/all/:agentId",
  (req: Request, res: Response) => {
    try {
      const { agentId } = req.params;

      const agentState = stateManager.loadAgentState(agentId);
      if (!agentState) {
        res.status(404).json({ success: false, error: "Agent not found" });
      }

      const conversations = stateManager.listConversations(agentId);

      res.json({
        success: true,
        conversations: conversations,
      });
    } catch (error: any) {
      logger.error(
        `Error listing conversations for agent ${req.params.agentId}:`,
        error
      );
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get a specific conversation
router.get(
  "/conversations/get/:agentId/:connectionId",
  (req: Request, res: Response) => {
    try {
      const { agentId, connectionId } = req.params;

      const agentState = stateManager.loadAgentState(agentId);
      if (!agentState) {
        res.status(404).json({ success: false, error: "Agent not found" });
      }

      const conversation = stateManager.getConversation(agentId, connectionId);

      res.json({
        success: true,
        messages: conversation,
      });
    } catch (error: any) {
      logger.error(
        `Error getting conversation ${req.params.connectionId} for agent ${req.params.agentId}:`,
        error
      );
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Add a message to a conversation
router.post(
  "/conversations/message/:agentId/:connectionId",
  async (req: Request, res: Response) => {
    try {
      const { agentId, connectionId } = req.params;
      const { content, direction = "inbound" } = req.body;

      if (!content) {
        res
          .status(400)
          .json({ success: false, error: "Message content is required" });
      }

      const agentState = stateManager.loadAgentState(agentId);
      if (!agentState) {
        res.status(404).json({ success: false, error: "Agent not found" });
      }

      const message = {
        content,
        direction,
        timestamp: new Date().toISOString(),
      };

      stateManager.saveConversation(agentId, connectionId, message);

      res.status(201).json({
        success: true,
        message,
      });
    } catch (error: any) {
      logger.error(
        `Error adding message to conversation ${req.params.connectionId} for agent ${req.params.agentId}:`,
        error
      );
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
