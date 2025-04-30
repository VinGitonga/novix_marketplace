// import express, { Request, Response } from "express";
// import { APP_PORT, HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY } from "./env";
// import { logger } from "./logger/winston";
// import agentRoutes from "./routes/agent";
// import newAgentsRoutes from "./routes/new-agents";
// import http from "http";
// import { Server, Socket } from "socket.io";
// import { AIMessage } from "@langchain/core/messages";
// import { HCS10Client } from "@hashgraphonline/standards-sdk";
// import { ConnectionManagerRegistry } from "./connection-mg/connection-registry";
// import { sendMessage, startMessageMonitoring } from "./connection-mg/message";
// import { agentExecutor, initializeAgent } from "./agent";
// import cors from "cors";

// const app = express();
// const sessionStore: { [key: string]: any } = {};

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
//   allowEIO3: true,
// });

// // Define two namespaces
// const agentNamespace = io.of("/api/agent/socket"); // For agent execution
// const connectionNamespace = io.of("/api/connection"); // For ConnectionManager events

// app.use(express.json());
// // app.use(cors());

// const client = new HCS10Client({
//   network: "testnet",
//   operatorId: HEDERA_OPERATOR_ID,
//   operatorPrivateKey: HEDERA_OPERATOR_KEY,
// });

// const connectionRegistry = new ConnectionManagerRegistry();

// // Middleware for both namespaces
// const socketMiddleware = async (
//   socket: Socket,
//   next: (err?: Error) => void
// ) => {
//   const sessionID = socket.handshake.auth.sessionID || socket.id;
//   const agentId = socket.handshake.auth.agentId || null; // Allow agentId to be optional

//   logger.debug(
//     `Session middleware: ${sessionID}, agentId: ${agentId || "none"}`
//   );

//   if (sessionStore[sessionID]) {
//     socket.data.session = sessionStore[sessionID];
//     logger.debug(`Restored session for ${sessionID}`);
//     return next();
//   }

//   socket.data.session = { sessionID, agentId };
//   sessionStore[sessionID] = socket.data.session;
//   logger.debug(
//     `Created new session: ${sessionID}${agentId ? ` for agent ${agentId}` : ""}`
//   );
//   next();
// };

// // Apply middleware to both namespaces
// // agentNamespace.use(socketMiddleware);
// connectionNamespace.use(socketMiddleware);

// // Agent Execution Namespace (/api/agent/socket)
// agentNamespace.on("connection", async (socket: Socket) => {
//   const { sessionID, agentId } = socket.data.session;
//   logger.info(
//     `Agent namespace client connected: ${socket.id} for agent ${agentId}`
//   );
//   socket.emit("session", { sessionID, agentId });

//   socket.on("message", async (data: { input: string }) => {
//     logger.debug("Received message data:", data);
//     try {
//       const { input } = data;
//       if (!input || typeof input !== "string") {
//         socket.emit("error", { message: "Invalid or missing input" });
//         return;
//       }

//       const stream = await agentExecutor.stream({
//         input,
//         chat_history: [new AIMessage("Hello Cob! How can I assist you today?")],
//       });

//       for await (const chunk of stream) {
//         if (chunk.ops?.length > 0) {
//           for (const op of chunk.ops) {
//             if (op.op === "add") {
//               if (op.path.startsWith("/logs")) {
//                 const logEntry = op.value;
//                 if (typeof logEntry === "string") {
//                   socket.emit("message", {
//                     type: "thinking",
//                     message: logEntry,
//                   });
//                 } else if (logEntry.type === "tool_start") {
//                   socket.emit("message", {
//                     type: "action",
//                     message: `Using tool: ${logEntry.name}`,
//                     tool: logEntry.name,
//                     toolInput: logEntry.input,
//                   });
//                 } else if (logEntry.type === "tool_end") {
//                   socket.emit("message", {
//                     type: "observation",
//                     message: logEntry.output,
//                     tool: logEntry.name,
//                   });
//                 } else if (logEntry.type === "agent_action") {
//                   socket.emit("message", {
//                     type: "action",
//                     message: `Calling tool: ${logEntry.tool}`,
//                     tool: logEntry.tool,
//                     toolInput: logEntry.toolInput,
//                   });
//                 }
//               } else if (op.path === "/final_output") {
//                 socket.emit("message", {
//                   type: "output",
//                   message: op.value.output,
//                 });
//               }
//             }
//           }
//         } else {
//           socket.emit("message", {
//             type: "output",
//             message: chunk?.output,
//           });
//         }
//       }

//       socket.emit("message", { type: "done" });
//     } catch (err) {
//       console.log("error", err);
//       logger.error("Error in message handler:", err);
//       socket.emit("error", {
//         message: `Error streaming response: ${
//           err instanceof Error ? err.message : String(err)
//         }`,
//       });
//     }
//   });

//   socket.on("connect_error", (data) => {
//     console.log("data", data);
//   });

//   socket.on("disconnect", () => {
//     logger.info(
//       `Agent namespace client disconnected: ${socket.id} for agent ${agentId}`
//     );
//   });
// });

// // Connection Manager Namespace (/api/connection)
// connectionNamespace.on("connection", async (socket: Socket) => {
//   const { sessionID, agentId } = socket.data.session;
//   logger.info(
//     `Connection namespace client connected: ${socket.id} for agent ${agentId}`
//   );
//   socket.emit("session", { sessionID, agentId });

//   try {
//     // Get or create ConnectionManager for this agent
//     const connectionManager = await connectionRegistry.getConnectionManager(
//       agentId,
//       client
//     );

//     // Handle connection events for this agent's ConnectionManager
//     connectionManager.on("connection", (connection) => {
//       logger.info(
//         `New connection established: ${connection.id} to ${connection.targetAccountId} for agent ${agentId}`
//       );
//       socket.emit("connection", {
//         id: connection.id,
//         topicId: connection.topicId,
//         targetAccountId: connection.targetAccountId,
//         agentId,
//       });
//       startMessageMonitoring(client, connection.topicId, connectionNamespace); // Note: io is the root server, may need adjustment
//     });

//     connectionManager.on("close", (info) => {
//       logger.info(
//         `Connection closed: ${info.id} - Reason: ${info.reason} for agent ${agentId}`
//       );
//       socket.emit("connection_close", {
//         id: info.id,
//         reason: info.reason,
//         agentId,
//       });
//     });

//     connectionManager.on("error", (error) => {
//       logger.error(`Connection manager error for agent ${agentId}:`, error);
//       socket.emit("error", {
//         message: `Connection manager error: ${error.message}`,
//         agentId,
//       });
//     });

//     socket.on("disconnect", () => {
//       logger.info(
//         `Connection namespace client disconnected: ${socket.id} for agent ${agentId}`
//       );
//     });
//   } catch (err) {
//     logger.error(
//       `Failed to initialize ConnectionManager for agent ${agentId}:`,
//       err
//     );
//     socket.emit("error", {
//       message: `Failed to initialize connection for agent: ${
//         err instanceof Error ? err.message : String(err)
//       }`,
//     });
//     socket.disconnect();
//   }
// });

// // API routes (unchanged)
// app.get("/", (req: Request, res: Response) => {
//   res.status(200).send("Hello World");
// });

// app.use("/api/agent", agentRoutes);
// app.use("/api/new-agents", newAgentsRoutes);

// app.get("/api/connections", async (req: Request, res: Response) => {
//   try {
//     const agentId = req.query.agentId as string;
//     if (!agentId) {
//       res.status(400).json({ error: "agentId is required" });
//     }
//     const connectionManager = await connectionRegistry.getConnectionManager(
//       agentId,
//       client
//     );
//     const connections = connectionManager.getConnections();
//     res.status(200).json({ connections });
//   } catch (error) {
//     logger.error("Error fetching connections:", error);
//     res.status(500).json({ error: "Failed to fetch connections" });
//   }
// });

// app.get(
//   "/api/connections/:connectionId",
//   async (req: Request, res: Response) => {
//     try {
//       const agentId = req.query.agentId as string;
//       if (!agentId) {
//         res.status(400).json({ error: "agentId is required" });
//       }
//       const connectionManager = await connectionRegistry.getConnectionManager(
//         agentId,
//         client
//       );
//       const connection = connectionManager.getConnection(
//         req.params.connectionId
//       );
//       if (!connection) {
//         res.status(404).json({ error: "Connection not found" });
//       }
//       res.status(200).json({ connection });
//     } catch (error) {
//       logger.error("Error fetching connection:", error);
//       res.status(500).json({ error: "Failed to fetch connection" });
//     }
//   }
// );

// app.post("/api/connections", async (req: Request, res: Response) => {
//   const { targetInboundTopicId, memo, agentId } = req.body;
//   if (!targetInboundTopicId || !agentId) {
//     res
//       .status(400)
//       .json({ error: "targetInboundTopicId and agentId are required" });
//   }

//   try {
//     const connectionManager = await connectionRegistry.getConnectionManager(
//       agentId,
//       client
//     );
//     const result = await connectionManager.initiateConnection(
//       targetInboundTopicId,
//       memo
//     );
//     res.status(201).json({ connection: result });
//   } catch (error) {
//     logger.error("Error initiating connection:", error);
//     res.status(500).json({ error: "Failed to initiate connection" });
//   }
// });

// app.delete(
//   "/api/connections/:connectionId",
//   async (req: Request, res: Response) => {
//     const { connectionId } = req.params;
//     const { reason, agentId } = req.body;

//     if (!agentId) {
//       res.status(400).json({ error: "agentId is required" });
//     }

//     try {
//       const connectionManager = await connectionRegistry.getConnectionManager(
//         agentId,
//         client
//       );
//       const success = await connectionManager.closeConnection(
//         connectionId,
//         reason || "Connection closed"
//       );
//       if (!success) {
//         res.status(404).json({ error: "Connection not found" });
//       }
//       res.status(200).json({ message: "Connection closed successfully" });
//     } catch (error) {
//       logger.error("Error closing connection:", error);
//       res.status(500).json({ error: "Failed to close connection" });
//     }
//   }
// );

// app.post(
//   "/api/connections/:connectionId/message",
//   async (req: Request, res: Response) => {
//     const { connectionId } = req.params;
//     const { message, agentId } = req.body;

//     if (!message || !agentId) {
//       res.status(400).json({ error: "message and agentId are required" });
//       return;
//     }

//     try {
//       const connectionManager = await connectionRegistry.getConnectionManager(
//         agentId,
//         client
//       );
//       const connection = connectionManager.getConnection(connectionId);
//       if (!connection) {
//         res.status(404).json({ error: "Connection not found" });
//         return;
//       }

//       console.log("connection", connection);

//       const success = await sendMessage(
//         client,
//         connection.connectionTopicId,
//         message
//       );
//       if (success) {
//         res.status(200).json({ message: "Message sent successfully" });
//       } else {
//         res.status(500).json({ error: "Failed to send message" });
//       }
//     } catch (error) {
//       logger.error("Error sending message:", error);
//       res.status(500).json({ error: "Failed to send message" });
//     }
//   }
// );

// app.get("/*splat", (req: Request, res: Response) => {
//   res.status(500).json({ success: false, msg: "Internal Server Error" });
// });

// async function startServer() {
//   try {
//     await initializeAgent();
//     server.listen(APP_PORT, () => {
//       logger.info(`Server for Hedera Started on Port: ${APP_PORT}`);
//     });
//   } catch (err) {
//     logger.error("Failed to initialize agent:", { err });
//     process.exit(1);
//   }
// }

// startServer();

import express from "express";
import { APP_PORT } from "./env";
import { logger } from "./logger/winston";
import agentRoutes from "./routes/agent";
import newAgentsRoutes from "./routes/new-agents";
import hcsTopicRoutes from "./routes/hcs-topics";
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
app.use("/api/new-agents", newAgentsRoutes);
app.use("/api/hcs-topics", hcsTopicRoutes);


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
