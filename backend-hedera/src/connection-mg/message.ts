import { EventEmitter } from "events";
import { HCS10Client, Logger } from "@hashgraphonline/standards-sdk";
import { logger } from "../logger/winston";
import { Namespace } from "socket.io";

export class MessageMonitor extends EventEmitter {
  private client: HCS10Client;
  private topicId: string;
  private running: boolean = false;
  private lastProcessedTimestamp: number = 0;
  private lastProcessedSequenceNumber: number = 0;
  private logger = Logger.getInstance({ module: "MessageMonitor" });
  private pollInterval: number = 3000;

  constructor(client: HCS10Client, topicId: string) {
    super();
    this.client = client;
    this.topicId = topicId;
  }

  start(): MessageMonitor {
    if (this.running) return this;
    this.running = true;
    this.logger.info(`Starting message monitor for topic ${this.topicId}`);
    this.poll();
    return this;
  }

  stop(): void {
    this.running = false;
    this.logger.info(`Stopped message monitor for topic ${this.topicId}`);
  }

  setPollInterval(ms: number): MessageMonitor {
    this.pollInterval = ms;
    return this;
  }

  setLastProcessedTimestamp(timestamp: number): MessageMonitor {
    this.lastProcessedTimestamp = timestamp;
    return this;
  }

  setLastProcessedSequenceNumber(sequenceNumber: number): MessageMonitor {
    this.lastProcessedSequenceNumber = sequenceNumber;
    return this;
  }

  private async poll(): Promise<void> {
    if (!this.running){
      console.log('Not running')
      return 
    }

    try {
      const msg= await this.client.getMessageStream(this.topicId);
      console.log('conn-1745941678765-96', msg)
      const { messages } = await this.client.getMessageStream(this.topicId);
      this.logger.debug(
        `Fetched ${messages.length} messages for topic ${this.topicId}`
      );
      if(msg.messages?.[0]){
        const content = await this.client.getMessageContent(msg.messages?.[0].data);
        console.log('content', content)
      }

      const newMessages = messages
        .filter((msg) => {
          const timestamp = Number(msg.consensus_timestamp);
          const sequenceNumber = Number(msg.sequence_number);
          const isNew =
            sequenceNumber > this.lastProcessedSequenceNumber &&
            timestamp > this.lastProcessedTimestamp;
          this.logger.debug(
            `Message ${sequenceNumber}: timestamp=${timestamp}, sequence=${sequenceNumber}, lastProcessedSeq=${this.lastProcessedSequenceNumber}, lastProcessedTs=${this.lastProcessedTimestamp}, isNew=${isNew}`
          );
          return isNew;
        })
        .sort(
          (a, b) =>
            Number(a.consensus_timestamp) - Number(b.consensus_timestamp)
        );

      for (const message of newMessages) {
        const processedMessage = await this.processMessage(message);
        this.logger.info(
          `Processed message ${processedMessage.id} from ${processedMessage.sender}`
        );
        this.emit("message", processedMessage);
        this.lastProcessedTimestamp = Math.max(
          this.lastProcessedTimestamp,
          Number(message.consensus_timestamp)
        );
        this.lastProcessedSequenceNumber = Math.max(
          this.lastProcessedSequenceNumber,
          Number(message.sequence_number)
        );
      }
    } catch (error) {
      this.logger.error(
        `Error polling messages for topic ${this.topicId}: ${error.message}`
      );
      this.emit("error", error);
    }

    if (this.running) {
      setTimeout(() => this.poll(), this.pollInterval);
    }
  }

  private async processMessage(message: any) {
    let data = message.data;
    let isHcs1Reference = false;

    if (typeof data === "string" && data.startsWith("hcs://1/")) {
      isHcs1Reference = true;
      this.logger.debug(`Resolving large content reference: ${data}`);
      try {
        data = await this.client.getMessageContent(data);
      } catch (error) {
        this.logger.error(
          `Failed to resolve content reference: ${error.message}`
        );
        throw error;
      }
    }

    if (
      typeof data === "string" &&
      (data.startsWith("{") || data.startsWith("["))
    ) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        this.logger.debug(`Message data is not valid JSON: ${data}`);
      }
    }

    return {
      id: message.sequence_number,
      sender: message.operator_id,
      timestamp: message.consensus_timestamp,
      data,
      meta: {
        isLargeContent: isHcs1Reference,
        memo: message.m,
        raw: message,
      },
    };
  }
}

export function startMessageMonitoring(
  client: HCS10Client,
  connectionTopicId: string,
  namespace: Namespace
) {
  const monitor = new MessageMonitor(client, connectionTopicId).start();

  monitor.on("message", (message) => {
    const { id, sender, data, timestamp } = message;
    logger.info(
      `Emitting hcs_message #${id} from ${sender} for topic ${connectionTopicId}`
    );
    namespace.emit("hcs_message", {
      connectionTopicId,
      messageId: id,
      sender,
      data,
      timestamp,
    });

    // Handle specific message types without auto-responding
    if (typeof data === "object" && data.type) {
      switch (data.type) {
        case "query":
          handleQuery(data, sender, connectionTopicId, client);
          break;
        case "training_data":
          handleTrainingData(data, sender, connectionTopicId, client);
          break;
        case "close_connection":
          handleCloseRequest(data, sender, connectionTopicId, client);
          break;
        default:
          logger.info(`Received message with type: ${data.type}`);
      }
    } else {
      logger.info(`Text message: ${data}`);
      // Removed auto-response to prevent loops
    }
  });

  monitor.on("error", (error) => {
    logger.error(
      `Message monitor error for topic ${connectionTopicId}: ${error.message}`
    );
    namespace.emit("error", {
      message: `Message monitor error: ${error.message}`,
    });
  });

  return monitor;
}

async function handleQuery(
  data: any,
  sender: string,
  connectionTopicId: string,
  client: HCS10Client
) {
  logger.info(`Processing query: ${data.query}`);
  const result = {
    type: "query_response",
    requestId: data.requestId,
    result: {
      price: 0.085,
      currency: data.parameters?.currency || "USD",
      timestamp: new Date().toISOString(),
    },
  };
  await sendMessage(client, connectionTopicId, result);
}

async function handleTrainingData(
  data: any,
  sender: string,
  connectionTopicId: string,
  client: HCS10Client
) {
  logger.info(
    `Received training dataset with ${data.records?.length || 0} records`
  );
  await sendMessage(client, connectionTopicId, {
    type: "processing_complete",
    dataset: data.dataset,
    recordsProcessed: data.records?.length || 0,
    status: "success",
  });
}

async function handleCloseRequest(
  data: any,
  sender: string,
  connectionTopicId: string,
  client: HCS10Client
) {
  logger.info(`Connection close requested by ${sender}: ${data.reason}`);
  await sendMessage(client, connectionTopicId, {
    type: "close_acknowledged",
    message: "Connection close request acknowledged",
  });
}

export async function sendMessage(
  client: HCS10Client,
  connectionTopicId: string,
  data: any
) {
  try {
    const content = typeof data === "object" ? JSON.stringify(data) : data;
    const sequenceNumber = await client.sendMessage(connectionTopicId, content);
    logger.info(
      `Sent message to topic ${connectionTopicId}, sequence number: ${sequenceNumber}`
    );
    return sequenceNumber; // Return sequence number for tracking
  } catch (error) {
    logger.error(
      `Failed to send message to topic ${connectionTopicId}: ${error.message}`
    );
    return false;
  }
}
