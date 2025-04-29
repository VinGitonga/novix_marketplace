import { model, Schema } from "mongoose";
import MessageSchema from "./message";

const ConversationSchema = new Schema({
  connectionId: { type: String, required: true },
  agentId: { type: String, required: true },
  created: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  messages: [MessageSchema],
});

ConversationSchema.index({ agentId: 1, connectionId: 1 }, { unique: true });

const Conversation = model("Conversation", ConversationSchema);

export default Conversation;
