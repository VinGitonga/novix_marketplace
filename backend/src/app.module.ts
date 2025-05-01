import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./config/configuration";
import { MongooseModule } from "@nestjs/mongoose";
import { AgentModule } from "./agent/agent.module";
import { MoonscapeModule } from './moonscape/moonscape.module';
import { ConnectionManagerModule } from './connection-manager/connection-manager.module';
import { UsersModule } from './users/users.module';
import { AssetModule } from './asset/asset.module';

@Module({
	imports: [
		ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get("mongo_uri"),
			}),
			inject: [ConfigService],
		}),
		AgentModule,
		MoonscapeModule,
		UsersModule,
		AssetModule,
		// ConnectionManagerModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
