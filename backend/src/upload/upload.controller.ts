import { Body, Controller, HttpStatus, Logger, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { AppReply } from "src/types/ApiResponse";
import { CustomBadRequestException } from "src/exceptions";

@Controller("api/uploads")
export class UploadController {
	private readonly logger = new Logger(UploadController.name);
	constructor(private readonly uploadService: UploadService) {}

	@Post("single")
	@UseInterceptors(FileInterceptor("file"))
	async uploadSingleFile(@UploadedFile() file: Express.Multer.File, @Body() body: { folder?: string }, @Res() res: AppReply<string>) {
		try {
			const data = await this.uploadService.uploadSingleFile(file);

			return res.status(HttpStatus.OK).json({ status: "success", data });
		} catch (err) {
			console.log("err:00", err);
			this.logger.error(`An error was encountered uploading file to storage due to: ${err?.message}`);
			throw new CustomBadRequestException(err?.message);
		}
	}
}
