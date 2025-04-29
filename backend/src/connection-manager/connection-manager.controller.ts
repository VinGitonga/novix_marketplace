import { Controller, Post, Get, Body, Param, Delete, OnModuleInit } from "@nestjs/common";
import { ConnectionManagerService } from "./connection-manager.service";
import { InitiateConnectionDto } from "./dto/initiate-connection.dto";
import { CloseConnectionDto } from "./dto/close-connection.dto";
import { RegisterAgentDto } from "./dto/register-agent.dto";
import { Connection } from "./interfaces/connection.interface";

@Controller("connections")
export class ConnectionManagerController implements OnModuleInit {
	constructor(private readonly connectionManagerService: ConnectionManagerService) {}

	onModuleInit() {
		// Event listeners for connection events
		this.connectionManagerService.on("connection", (connection: Connection) => {
			console.log(`New connection established: ${connection.id} to ${connection.targetAccountId}`);
		});

		this.connectionManagerService.on("close", (info) => {
			console.log(`Connection closed: ${info.id} - Reason: ${info.reason}`);
		});

		this.connectionManagerService.on("error", (error) => {
			console.error("Connection manager error:", error);
		});
	}

	@Post("register")
	registerAgent(@Body() dto: RegisterAgentDto): void {
		this.connectionManagerService.registerAgent(dto.accountId, dto.inboundTopicId);
	}

	@Post("start-monitoring/:accountId")
	startMonitoring(@Param("accountId") accountId: string): void {
		this.connectionManagerService.startMonitoring(accountId);
	}

	@Post("stop-monitoring/:accountId")
	stopMonitoring(@Param("accountId") accountId: string): void {
		this.connectionManagerService.stopMonitoring(accountId);
	}

	@Post("initiate")
	async initiateConnection(@Body() dto: InitiateConnectionDto & { initiatorAccountId: string }): Promise<Connection> {
		return this.connectionManagerService.initiateConnection(dto.initiatorAccountId, dto.targetInboundTopicId, dto.memo, dto.initiatorInboundTopicId);
	}

	@Get()
	getConnections(): Connection[] {
		return this.connectionManagerService.getConnections();
	}

	@Get(":id")
	getConnection(@Param("id") id: string): any {
		return this.connectionManagerService.getConnection(id);
	}

	@Delete("close")
	async closeConnection(@Body() dto: CloseConnectionDto): Promise<boolean> {
		return this.connectionManagerService.closeConnection(dto.connectionId, dto.reason);
	}
}
