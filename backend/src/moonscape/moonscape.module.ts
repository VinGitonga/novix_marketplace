import { Module } from "@nestjs/common";
import { MoonscapeService } from "./moonscape.service";
import { MoonscapeController } from "./moonscape.controller";
import { HttpModule } from "@nestjs/axios";

@Module({
	imports: [HttpModule],
	controllers: [MoonscapeController],
	providers: [MoonscapeService],
})
export class MoonscapeModule {}
