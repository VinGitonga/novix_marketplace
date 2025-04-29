import { logger } from "../logger/winston";
import { agentExecutor } from "../utils/initLangChainHedera";

export async function chatLoop(message: string) {
  try {
    const result = await agentExecutor.invoke({ input: message });

    return result.output;
  } catch (err) {
    logger.error("Error in chat loop", { err });
    return `Sorry, I encountred an error processing your request. Please try again`;
  }
}

export async function chatLoopStream(message: string) {
  for await (const chunk of await agentExecutor.stream({ input: message })) {
  }
}
