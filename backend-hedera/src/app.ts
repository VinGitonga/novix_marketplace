import express from "express";
import { APP_PORT } from "./env";
import { logger } from "./logger/winston";
import agentRoutes from "./routes/agent";
import { agentExecutor, initializeAgent } from "./agent";
import http from "http";
import { Server, Socket } from "socket.io";
import { AIMessage } from "@langchain/core/messages";
const app = express();

const sessionStore: { [key: string]: any } = {};

app.use(express.json());

app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).send("Hello World");
});

app.use("/api/agent", agentRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  path: "/api/agent/socket",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
});

io.use((socket: Socket, next) => {
  const sessionID = socket.handshake.auth.sessionID || socket.id;
  logger.debug(`Session middleware: ${sessionID}`);

  if (sessionStore[sessionID]) {
    socket.data.session = sessionStore[sessionID];
    logger.debug(`Restored session for ${sessionID}`);
    return next();
  }

  socket.data.session = { sessionID };
  sessionStore[sessionID] = socket.data.session;
  logger.debug(`Created new session: ${sessionID}`);
  next();
});

io.on("connection", (socket) => {
  logger.info(`Socket.IO client connected: ${socket.id}`);

  socket.emit("session", { sessionID: socket.data.session.sessionID });

  socket.on("message", async (data: { input: string }) => {
    logger.debug("Received message data:", data);
    try {
      const { input } = data;
      if (!input || typeof input !== "string") {
        socket.emit("error", { message: "Invalid or missing input" });
        return;
      }

      // Stream the agent execution
      const stream = await agentExecutor.stream({
        input,
        chat_history: [new AIMessage("Hello Cob! How can I assist you today?")],
      });

      // Process the stream chunks
      for await (const chunk of stream) {
        // console.log("chunk", chunk); // chunk { output: 'Hello! How can I assist you today?' }
        // Process operations in the chunk
        if (chunk.ops?.length > 0) {
          for (const op of chunk.ops) {
            // Only process 'add' operations
            if (op.op === "add") {
              // Process logs entries
              if (op.path.startsWith("/logs")) {
                const logEntry = op.value;

                // Handle different types of log entries
                if (typeof logEntry === "string") {
                  // Text output from the LLM
                  socket.emit("message", {
                    type: "thinking",
                    message: logEntry,
                  });
                } else if (logEntry.type === "tool_start") {
                  // Tool being called
                  socket.emit("message", {
                    type: "action",
                    message: `Using tool: ${logEntry.name}`,
                    tool: logEntry.name,
                    toolInput: logEntry.input,
                  });
                } else if (logEntry.type === "tool_end") {
                  // Tool finished execution
                  socket.emit("message", {
                    type: "observation",
                    message: logEntry.output,
                    tool: logEntry.name,
                  });
                } else if (logEntry.type === "agent_action") {
                  // Agent decided to use a tool
                  socket.emit("message", {
                    type: "action",
                    message: `Calling tool: ${logEntry.tool}`,
                    tool: logEntry.tool,
                    toolInput: logEntry.toolInput,
                  });
                }
              }
              // Process final output
              else if (op.path === "/final_output") {
                socket.emit("message", {
                  type: "output",
                  message: op.value.output,
                });
              }
            }
          }
        } else {
          socket.emit("message", {
            type: "output",
            message: chunk?.output,
          });
        }
      }

      // Signal completion
      socket.emit("message", { type: "done" });
    } catch (err) {
      logger.error("Error in message handler:", err);
      socket.emit("error", {
        message: `Error streaming response: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
    }
  });

  socket.on("disconnect", () => {
    logger.info(`Socket.IO client disconnected: ${socket.id}`);
  });
});

app.get("/*splat", (req: express.Request, res: express.Response) => {
  res.status(500).json({ success: false, msg: "Internal Server Error" });
});

async function startServer() {
  try {
    await initializeAgent();
    server.listen(APP_PORT, () => {
      logger.info(`Server for Hedara Started on Port: ${APP_PORT}`);
    });
  } catch (err) {
    logger.error("Failed to initialize agent:", { err });
    process.exit(1);
  }
}

startServer();
