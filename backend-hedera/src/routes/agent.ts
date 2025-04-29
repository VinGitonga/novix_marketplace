import express, { Request, Response } from "express";
import { chat } from "../agent";

const router = express.Router();

// Endpoint to send a message to the agent
router.post("/chat", async (req: Request, res: Response) => {
  const { input } = req.body;
  if (!input || typeof input !== "string") {
    res.status(400).json({ error: "Invalid or missing input" });
  }
  try {
    const response = await chat(input);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Endpoint to list connections
router.get("/connections", async (req: Request, res: Response) => {
  try {
    const response = await chat("List all active connections");
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: "Failed to list connections" });
  }
});

// Endpoint to initiate a connection
router.post("/connect", async (req: Request, res: Response) => {
  const { accountId } = req.body;
  if (!accountId || typeof accountId !== "string") {
    res.status(400).json({ error: "Invalid or missing accountId" });
  }
  try {
    const response = await chat(
      `Initiate a connection to agent with account ID ${accountId}`
    );
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: "Failed to initiate connection" });
  }
});

// Endpoint to check messages
router.get("/messages", async (req: Request, res: Response) => {
  try {
    const response = await chat("Check for new messages");
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: "Failed to check messages" });
  }
});

export default router;
