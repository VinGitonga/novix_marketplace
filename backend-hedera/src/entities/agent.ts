import { model, Schema } from "mongoose";

const AgentSchema = new Schema({
  accountId: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true },
  inboundTopicId: { type: String, required: true },
  outboundTopicId: { type: String, required: true },
  profileTopicId: { type: String, required: true },
  pfpTopicId: { type: String },
  network: { type: String, default: "testnet" },
  created: { type: Date, default: Date.now },
  name: { type: String, required: true },
  description: { type: String, required: true },
  metadata: { type: Object, default: {} },
  conversationAgentId: { type: String },
});

const Agent = model("AgentData", AgentSchema);

export default Agent;
