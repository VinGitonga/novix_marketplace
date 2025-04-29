import { Module } from "@nestjs/common";
import { ConnectionManagerService } from "./connection-manager.service";
import { ConnectionManagerController } from "./connection-manager.controller";

@Module({
	providers: [ConnectionManagerService],
	controllers: [ConnectionManagerController],
	exports: [ConnectionManagerService],
})
export class ConnectionManagerModule {}
