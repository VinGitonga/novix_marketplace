import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
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
}
