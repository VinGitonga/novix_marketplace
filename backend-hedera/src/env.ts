import * as dotenv from "dotenv";

dotenv.config();

export const APP_PORT = 7834;
export const HEDERA_OPERATOR_ID = process.env.HEDERA_OPERATOR_ID!;
export const HEDERA_OPERATOR_KEY = process.env.HEDERA_OPERATOR_KEY!;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
export const REGISTRY_URL = process.env.REGISTRY_URL!;
export const HEDERA_INBOUND_TOPIC_ID = ""