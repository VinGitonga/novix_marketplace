import { TopicId } from "@hashgraph/sdk";
import { StructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { HederaAgentKit, TransferHBARResult } from "hedera-agent-kit";
import { z } from "zod";

interface IAgent {
  _id: string;
  name: string;
  summary: string;
  description: string;
  prompt: string;
  topics: string[];
  bio: string[];
  createdAt: string;
  price: number;
}

const dbBackendUrl = "http://localhost:6534";

async function updateAgentToNewOwner(
  agentData: any,
  kit: HederaAgentKit,
  newOwnerAccountId: string
) {
  try {
    const rawResp = await axios.post<{
      status: "success" | "error";
      data: any;
    }>(`${dbBackendUrl}/api/agents/update/owner`, {
      agentId: agentData?._id,
      ownerId: agentData?.owner?._id,
    });

    const resp = rawResp.data;

    if (resp?.status === "success") {
      const memo = `Tranfer Agent Owner`;
      const message = `Transfered Agent: ${agentData?.name} from ${agentData?.owner?.accountId} to ${newOwnerAccountId} for ${agentData?.price} HBAR`;

      const createTopicResult = await kit.createTopic(memo, true);

      const dataRawResp = JSON.stringify(createTopicResult, null, 2);

      const rawResp = JSON.parse(dataRawResp);

      const submitResult = await kit.submitTopicMessage(
        TopicId.fromString(rawResp["topicId"]),
        message
      );

      const submitResp = submitResult.getRawResponse();

      return rawResp["topicId"];
    }

    return null;
  } catch (err) {
    console.log("error", err);
    return null;
  }
}

export class AgentMakePaymentTool extends StructuredTool {
  name = "pay_for_ai_agent";
  description =
    "Make payments on behalf of user for AI agent in Novix Marketplace";

  schema = z.object({
    accountId: z
      .string()
      .describe(
        "Natural languange for Account ID for the user's wallet in Hedera"
      ),
    privateKey: z.string().describe("Natural language for user's private key"),
    publicKey: z.string().describe("Natural language for user's public key"),
    query: z
      .string()
      .describe("The natural language query to search for AI agents"),
    maxResults: z
      .number()
      .min(1)
      .max(2)
      .optional()
      .describe("Maximum number of results to return (default: 1)"),
  });

  constructor(private dbBackendUrl: string = dbBackendUrl) {
    super();
  }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    try {
      const { accountId, privateKey, publicKey, query, maxResults } = input;

      const kit = new HederaAgentKit(
        accountId,
        privateKey,
        publicKey,
        "testnet"
      );

      const response = await axios.post<{
        status: "success" | "error";
        data: { results: IAgent[]; count: number };
      }>(`${this.dbBackendUrl}/api/agents/search/by-nlp`, {
        query,
        maxResults,
      });

      const respData = response.data;

      if (respData?.status === "success") {
        const { results, count } = respData.data;

        const agentData = results?.[0];

        if (agentData) {
          // get agent details with owner
          const agentInfo = await axios.get<{
            success: boolean;
            data: IAgent & { owner: any };
          }>(
            `${this.dbBackendUrl}/api/agents/profile/details/${agentData?._id}`
          );

          const agentdataInfo = agentInfo.data.data;

          console.log("agentdataInfo", agentdataInfo);

          const transferResult = await kit.transferHbar(
            agentdataInfo.owner.accountId,
            String(agentdataInfo.price ?? "1")
          );

          // update the new owner
          // we should create a new topic as a details
          const topicId = await updateAgentToNewOwner(
            agentdataInfo,
            kit,
            accountId
          );

          const txLink = `https://hashscan/testnet/transaction/${
            (
              transferResult.getRawResponse() as TransferHBARResult
            ).txHash.split("@")[1]
          }`;
          return `Transfered ${
            agentdataInfo.price ?? "1"
          } HBAR from account to owner's account. Transaction Link is: ${txLink} with a verifiable Topic message at: ${topicId}`;
        }

        return `Unable to perform transaction at the moment`;
      }
      return `Unable to perform transaction at the moment`;
    } catch (err) {
      console.log(`Erroroor`, err);
    }
  }
}
