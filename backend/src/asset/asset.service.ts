import { Injectable } from "@nestjs/common";
import { MetadataDto } from "./dto/metadata.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Asset, Metadata } from "src/entities/asset.entity";
import { Model } from "mongoose";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AssetService {
	constructor(
		@InjectModel(Asset.name) private readonly assetModel: Model<Asset>,
		private readonly httpService: HttpService,
	) {}
	async createNewAsset(body: MetadataDto) {
		this.validateMetadata(body);

		const hcsTopicId = await this.storeMetadataOnHCS(body);

		const asset = new this.assetModel({
			body,
			hcs_topic_id: hcsTopicId,
		});
		await asset.save();

		return asset;
	}

	private validateMetadata(metadata: Metadata) {
		if (!["model", "dataset"].includes(metadata.asset_type)) {
			throw new Error("Invalid asset_type");
		}
		if (!metadata.general.name || !metadata.general.description) {
			throw new Error("Name and description are required");
		}
		if (metadata.asset_type === "model" && !metadata.technical.model_details) {
			throw new Error("Model details are required for models");
		}
		if (metadata.asset_type === "dataset" && !metadata.technical.dataset_details) {
			throw new Error("Dataset details are required for datasets");
		}
		if (!metadata.licensing.license_type || !metadata.licensing.price || !metadata.licensing.currency) {
			throw new Error("Licensing details are required");
		}
		if (!metadata.ownership.creator_account_id) {
			throw new Error("Creator account ID is required");
		}
	}

	private async storeMetadataOnHCS(metadata: Metadata): Promise<string> {
		const config = {
			method: "post",
			maxBodyLength: Infinity,
			url: "http://localhost:7634/api/hcs-topics/create-topic-and-message",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			data: {
				memo: `Asset: ${metadata.general.name}`,
				message: JSON.stringify(metadata),
			},
		};

		try {
			const observableResp = this.httpService.request<{
				message: any;
				createTopic: any;
			}>(config);

			const resp = await firstValueFrom(observableResp);

			if (resp?.data?.message) {
				return resp.data?.createTopic?.["topicId"];
			}

			throw new Error("No topicId returned from HCS endpoint");
		} catch (error) {
			throw new Error("Failed to store metadata on HCS: " + error.message);
		}
	}
}
