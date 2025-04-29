// Mock window object for Node.js
if (typeof window === "undefined") {
	(global as any).window = {};
}
import { Injectable, Logger } from "@nestjs/common";
import { HCS10Client } from "@hashgraphonline/standards-sdk";
import { EventEmitter } from "events";
import { Connection } from "./interfaces/connection.interface";
import { ConfigService } from "@nestjs/config";

const client = new HCS10Client({ network: "testnet", operatorId: "0.0.5871089", operatorPrivateKey: "0xfda23da303ca943b7285e482abf8ca81141384a6c79c8f1845215c1afa8e674a" });

@Injectable()
export class ConnectionManagerService extends EventEmitter {
	private agents: Map<string, { inboundTopicId: string; monitoring: boolean }>; // Map accountId to inboundTopicId and monitoring state
	private connections: Map<
		string,
		{
			connectionTopicId: string;
			targetAccountId: string;
			isActive: boolean;
			lastActivity: number;
			metadata?: any;
		}
	>;
	private lastProcessedMessages: Map<string, number>; // Track last processed message per topic
	private pollInterval: number = 3000;
	private logger = new Logger(ConnectionManagerService.name);

	constructor(private configService: ConfigService) {
		super();
		// this.client = new HCS10Client({ network: "testnet", operatorId: this.configService.get("HEDERA_ACCOUNT_ID"), operatorPrivateKey: this.configService.get("OPERATOR_ID") });
		this.agents = new Map();
		this.connections = new Map();
		this.lastProcessedMessages = new Map();
	}

	/**
	 * Register an agent with its inboundTopicId
	 */
	registerAgent(accountId: string, inboundTopicId: string): void {
		this.agents.set(accountId, { inboundTopicId, monitoring: false });
		this.lastProcessedMessages.set(inboundTopicId, 0);
		this.logger.log(`Agent registered: ${accountId} with topic ${inboundTopicId}`);
	}

	/**
	 * Start monitoring for an agent's inbound topic
	 */
	startMonitoring(accountId: string): ConnectionManagerService {
		const agent = this.agents.get(accountId);
		if (!agent) {
			throw new Error(`Agent ${accountId} not registered`);
		}
		if (agent.monitoring) return this;

		agent.monitoring = true;
		this.agents.set(accountId, agent);
		this.logger.log(`Starting connection monitoring for ${agent.inboundTopicId}`);
		this.monitorInboundTopic(accountId, agent.inboundTopicId);
		return this;
	}

	/**
	 * Stop monitoring for an agent's inbound topic
	 */
	stopMonitoring(accountId: string): void {
		const agent = this.agents.get(accountId);
		if (!agent) {
			throw new Error(`Agent ${accountId} not registered`);
		}
		agent.monitoring = false;
		this.agents.set(accountId, agent);
		this.logger.log(`Connection monitoring stopped for ${agent.inboundTopicId}`);
	}

	/**
	 * Get all active connections
	 */
	getConnections(): Connection[] {
		const result: Connection[] = [];
		this.connections.forEach((connection, id) => {
			if (connection.isActive) {
				result.push({
					id,
					topicId: connection.connectionTopicId,
					targetAccountId: connection.targetAccountId,
					initiatorInboundTopicId: connection.metadata?.initiatorInboundTopicId,
				});
			}
		});
		return result;
	}

	/**
	 * Get a specific connection by ID
	 */
	getConnection(connectionId: string): any {
		return this.connections.get(connectionId);
	}

	/**
	 * Get a connection by topic ID
	 */
	getConnectionByTopicId(topicId: string): any {
		for (const [id, connection] of this.connections.entries()) {
			if (connection.connectionTopicId === topicId) {
				return { id, ...connection };
			}
		}
		return null;
	}

	/**
	 * Initiate a connection to another agent
	 */
	async initiateConnection(initiatorAccountId: string, targetInboundTopicId: string, memo: string = "Connection request", initiatorInboundTopicId?: string): Promise<Connection> {
		try {
			const initiatorAgent = this.agents.get(initiatorAccountId);
			if (!initiatorAgent && !initiatorInboundTopicId) {
				throw new Error(`Initiator ${initiatorAccountId} not registered and no inboundTopicId provided`);
			}
			const effectiveInboundTopicId = initiatorInboundTopicId || initiatorAgent.inboundTopicId;

			this.logger.log(`Initiating connection from ${initiatorAccountId} to ${targetInboundTopicId}`);

			// Include initiator's inboundTopicId in the connection request payload
			const requestPayload = {
				memo,
				initiatorInboundTopicId: effectiveInboundTopicId,
			};

			const result = await client.submitConnectionRequest(targetInboundTopicId, JSON.stringify(requestPayload));
			const requestId = result.topicSequenceNumber.toNumber();
			this.logger.log(`Connection request sent with ID: ${requestId}`);

			const confirmation = await client.waitForConnectionConfirmation(targetInboundTopicId, requestId, 60, 2000);

			const connectionTopicId = confirmation.connectionTopicId;
			const targetAccountId = confirmation.confirmedBy;

			const connectionId = `conn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

			this.connections.set(connectionId, {
				connectionTopicId,
				targetAccountId,
				isActive: true,
				lastActivity: Date.now(),
				metadata: {
					initiator: true,
					created: new Date().toISOString(),
					requestId,
					initiatorInboundTopicId: effectiveInboundTopicId,
				},
			});

			this.logger.log(`Connection established: ${connectionId} -> ${connectionTopicId}`);
			this.emit("connection", {
				id: connectionId,
				topicId: connectionTopicId,
				targetAccountId,
				initiatorInboundTopicId: effectiveInboundTopicId,
			});

			return {
				id: connectionId,
				topicId: connectionTopicId,
				targetAccountId,
				initiatorInboundTopicId: effectiveInboundTopicId,
			};
		} catch (error) {
			this.logger.error("Failed to initiate connection:", error);
			throw error;
		}
	}

	/**
	 * Monitor an inbound topic for connection requests
	 */
	private async monitorInboundTopic(accountId: string, inboundTopicId: string): Promise<void> {
		const agent = this.agents.get(accountId);
		if (!agent || !agent.monitoring) return;

		try {
			const { messages } = await client.getMessages(inboundTopicId);
			const lastProcessedMessage = this.lastProcessedMessages.get(inboundTopicId) || 0;

			const connectionRequests = messages.filter((msg) => msg.op === "connection_request" && msg.sequence_number > lastProcessedMessage).sort((a, b) => a.sequence_number - b.sequence_number);

			for (const request of connectionRequests) {
				this.lastProcessedMessages.set(inboundTopicId, Math.max(lastProcessedMessage, request.sequence_number));
				await this.handleConnectionRequest(accountId, inboundTopicId, request);
			}
		} catch (error) {
			this.logger.error(`Error monitoring inbound topic ${inboundTopicId}:`, error);
			this.emit("error", error);
		}

		if (agent.monitoring) {
			setTimeout(() => this.monitorInboundTopic(accountId, inboundTopicId), this.pollInterval);
		}
	}

	/**
	 * Handle a single connection request
	 */
	private async handleConnectionRequest(accountId: string, inboundTopicId: string, request: any): Promise<void> {
		try {
			const requestingAccountId = request.operator_id.split("@")[1];
			const connectionRequestId = request.sequence_number;

			// Parse the request payload to extract initiator's inboundTopicId
			const requestPayload = JSON.parse(request.memo || "{}");
			const initiatorInboundTopicId = requestPayload.initiatorInboundTopicId;

			this.logger.log(`New connection request from ${requestingAccountId} to ${accountId}`);

			const response = await client.handleConnectionRequest(inboundTopicId, requestingAccountId, connectionRequestId);

			const connectionTopicId = response.connectionTopicId;
			const connectionId = `conn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

			this.connections.set(connectionId, {
				connectionTopicId,
				targetAccountId: requestingAccountId,
				isActive: true,
				lastActivity: Date.now(),
				metadata: {
					initiator: false,
					created: new Date().toISOString(),
					requestId: connectionRequestId,
					initiatorInboundTopicId,
				},
			});

			this.logger.log(`Connection established: ${connectionId} -> ${connectionTopicId}`);
			this.emit("connection", {
				id: connectionId,
				topicId: connectionTopicId,
				targetAccountId: requestingAccountId,
				initiatorInboundTopicId,
			});
		} catch (error) {
			this.logger.error(`Failed to handle connection request for ${accountId}:`, error);
			this.emit("error", error);
		}
	}

	/**
	 * Close a connection
	 */
	async closeConnection(connectionId: string, reason: string = "Connection closed"): Promise<boolean> {
		const connection = this.connections.get(connectionId);
		if (!connection) {
			this.logger.warn(`Connection not found: ${connectionId}`);
			return false;
		}

		try {
			await client.sendMessage(
				connection.connectionTopicId,
				JSON.stringify({
					type: "close_connection",
					reason,
					timestamp: new Date().toISOString(),
				}),
				"Connection close",
			);

			connection.isActive = false;
			this.connections.set(connectionId, connection);

			this.logger.log(`Connection closed: ${connectionId}`);
			this.emit("close", { id: connectionId, reason });
			return true;
		} catch (error) {
			this.logger.error(`Failed to close connection: ${connectionId}`, error);
			return false;
		}
	}
}
