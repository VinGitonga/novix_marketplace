import { Body, Controller, Get, HttpStatus, Param, Post, Res } from "@nestjs/common";
import { AssetService } from "./asset.service";
import { MetadataDto } from "./dto/metadata.dto";
import { AppReply } from "src/types/ApiResponse";
import { CustomBadRequestException } from "src/exceptions";

@Controller("api/assets")
export class AssetController {
	constructor(private readonly assetService: AssetService) {}

	@Post("create")
	async createNewAsset(@Body() body: MetadataDto, @Res() res: AppReply) {
		try {
			const data = await this.assetService.createNewAsset(body);

			return res.status(HttpStatus.CREATED).json({ status: "success", data });
		} catch (err) {
			throw new CustomBadRequestException(err.message);
		}
	}

	@Get("owner/all/:account_id")
	async getMyAssets(@Param("account_id") account_id: string, @Res() res: AppReply) {
		try {
			const data = await this.assetService.getMyAssets(account_id);

			return res.status(HttpStatus.OK).json({ status: "success", data });
		} catch (err) {
			throw new CustomBadRequestException(err.message);
		}
	}

	@Get()
	async getAllAssets(@Res() res: AppReply) {
		try {
			const data = await this.assetService.getAllAssets();

			return res.status(HttpStatus.OK).json({ status: "success", data });
		} catch (err) {
			throw new CustomBadRequestException(err.message);
		}
	}

	@Post("search/by-nlp")
	async searchAssetsByNLP(@Body() body: any, @Res() res: AppReply) {
		try {
			const assets = await this.assetService.searchAssetsByNLP(body);

			return res.status(HttpStatus.OK).json({ status: "success", data: assets });
		} catch (err) {
			throw new CustomBadRequestException();
		}
	}
}
