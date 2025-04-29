import { Schema } from "mongoose";

const MessageSchema = new Schema({
  content: { type: String, required: true },
  direction: { type: String, enum: ["inbound", "outbound"], required: true },
  timestamp: { type: Date, default: Date.now },
});

export default MessageSchema;
