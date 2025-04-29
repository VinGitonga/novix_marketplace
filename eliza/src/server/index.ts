import { ChannelType, type IAgentRuntime } from "@elizaos/core";
import express from "express";
import cors from "cors";

export async function runExpress(runtime: IAgentRuntime) {
  const app = express();
  app.use(express.json());

  app.use(cors());

  // app.options('*', cors())

  app.get("/", (req: express.Request, res: express.Response) => {
    res.status(200).send("Hello, this eliza backend");
  });

  app.get(
    "/worlds/get",
    async (req: express.Request, res: express.Response) => {
      try {
        const allWorlds = await runtime.getAllWorlds();

        runtime.getRoomsForParticipant;

        res.status(200).json(allWorlds);
      } catch (err) {
        console.log("Error occured", err);
        res.status(500).json({ message: "Failed" });
      }
    }
  );

  app.post(
    "/worlds/create",
    async (req: express.Request, res: express.Response) => {
      const data = req.body;

      try {
        const info = {
          name: data.name,
          agentId: runtime.agentId,
          serverId: "client_user",
        };

        const createdWorldId = await runtime.createWorld(info as any);

        res.status(200).json({ success: true, data: createdWorldId });
      } catch (err) {
        res.status(400).json({ success: false, msg: "Create not working" });
      }
    }
  );

  app.post("/send/msg", async (req: express.Request, res: express.Response) => {
    const ag = await runtime.getAgent("b102d90e-8be1-4d00-8cb1-edd54b6e1cb2");
    runtime;
  });

  app.get(
    "/api/agents/rooms/:agentId",
    async (req: express.Request, res: express.Response) => {
      const agentId = req.params.agentId;
      // const rooms = await runtime.room()
      const rooms = await runtime.getAllWorlds();

      res.status(200).json(rooms);
    }
  );

  app.post(
    "/api/agents/rooms/create/:agentId",
    async (req: express.Request, res: express.Response) => {
      try {
        const agentId = req.params.agentId;

        const info = {
          id: req.body.roomId,
          name: req.body.name,
          source: "client_chat:user",
          type: ChannelType.DM,
          agentId,
          worldId: req.body.worldId
        };

        const newRoom = await runtime.createRoom(info as any);

        res.status(200).json({ success: true, data: newRoom });
      } catch (err) {
        res.status(400).json({ success: false, msg: "Create not working" });
      }
    }
  );

  app.post("/api/agents/msg", async (req: express.Request, res: express.Response) => {
    const agentId = req.body.agentId;


    const userId = req.body.userId;
    const roomId = req.body.roomId;

    // await runtime.ensureConnection({userId, roomId, })
  })

  app.listen(6200, () => {
    console.log("App Running Within Eliza: ", 6200);
  });
}
