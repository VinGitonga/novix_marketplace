import { Module } from "@nestjs/common";
import { AssetService } from "./asset.service";
import { AssetController } from "./asset.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Asset, AssetSchema } from "src/entities/asset.entity";
import { HttpModule } from "@nestjs/axios";

@Module({
	imports: [MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]), HttpModule],
	controllers: [AssetController],
	providers: [AssetService],
})
export class AssetModule {}
