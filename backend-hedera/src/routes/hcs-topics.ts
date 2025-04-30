import { TopicId } from "@hashgraph/sdk";
import express from "express";
import { HederaAgentKit } from "hedera-agent-kit";

const router = express.Router();

const accountId = "0.0.5871089";
const privateKey =
  "3030020100300706052b8104000a04220420fda23da303ca943b7285e482abf8ca81141384a6c79c8f1845215c1afa8e674a";
const publicKey =
  "302d300706052b8104000a03220002354476db70bb414f571cabef74d014169152925883a45b0b755a0056a3d2d27a";

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
