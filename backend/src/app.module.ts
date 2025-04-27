import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./config/configuration";
import { MongooseModule } from "@nestjs/mongoose";
import { AgentModule } from "./agent/agent.module";

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
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
