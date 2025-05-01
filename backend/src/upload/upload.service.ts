import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PinataSDK } from "pinata";
import { PinataEnvConfig } from "src/types/Pinata";

@Injectable()
export class UploadService {
	private readonly logger = new Logger(UploadService.name);
	private readonly pinata: PinataSDK;
	constructor(private readonly configService: ConfigService<{ pinata: PinataEnvConfig }>) {
		this.pinata = new PinataSDK({
			pinataJwt: this.configService.get("pinata.jwt", { infer: true }),
			pinataGateway: this.configService.get("pinata.gateway", { infer: true }),
		});
	}
	async uploadSingleFile(file: Express.Multer.File) {
		const fileToUpload = new File([file.buffer], file.mimetype);
		const newUpload = await this.pinata.upload.public.file(fileToUpload);

		this.logger.log(`File Uploaded successfully. CID: ${newUpload.cid}`);

		return newUpload.cid;
	}

	async getFileFromPinata(cid: string) {
		try {
			const fileItem = await this.pinata.gateways.public.get(cid);

			return fileItem;
		} catch (err) {
			this.logger.error("Unable to retrieve file due to:", err);
			return null;
		}
	}
}
