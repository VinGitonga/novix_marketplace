import { Injectable } from "@nestjs/common";
import { MetadataDto } from "./dto/metadata.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Asset, Metadata } from "src/entities/asset.entity";
import { Model } from "mongoose";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

interface SearchQueryInfo {
	query?: string; // Text search query (e.g., "sentiment analysis")
	assetType?: "model" | "dataset"; // Filter by asset type
	category?: string; // Filter by category (e.g., "NLP")
	licenseType?: string; // Filter by license type (e.g., "Commercial")
	priceMin?: number; // Minimum price
	priceMax?: number; // Maximum price
	creatorId?: string; // Filter by creator_account_id
	tags?: string[]; // Filter by tags
	sortBy?: "relevance" | "price" | "size" | "name"; // Sort field
	sortOrder?: "asc" | "desc"; // Sort direction
	maxResults?: number; // Number of results to return (limit)
	skip?: number; // Number of results to skip (pagination)
}

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
			metadata: body,
			hcs_topic_id: hcsTopicId,
		});
		await asset.save();

		return asset;
	}

	async getMyAssets(account_id: string) {
		const data = await this.assetModel.find({ "metadata.ownership.creator_account_id": account_id });

		return data;
	}

	async getAllAssets() {
		return await this.assetModel.find({});
	}

	async searchAssetsByNLP(queryInfo: SearchQueryInfo) {
		const { query, assetType, category, licenseType, priceMin, priceMax, creatorId, tags, sortBy = "relevance", sortOrder = "desc", maxResults = 10, skip = 0 } = queryInfo;

		// Build MongoDB query
		const matchConditions: any[] = [];

		// Text search
		if (query) {
			matchConditions.push({ $text: { $search: query } });
		}

		// Filters
		if (assetType) {
			matchConditions.push({ "metadata.asset_type": assetType });
		}
		if (category) {
			matchConditions.push({ "metadata.general.category": category });
		}
		if (licenseType) {
			matchConditions.push({ "metadata.licensing.license_type": licenseType });
		}
		if (priceMin !== undefined || priceMax !== undefined) {
			const priceFilter: any = {};
			if (priceMin !== undefined) priceFilter.$gte = priceMin;
			if (priceMax !== undefined) priceFilter.$lte = priceMax;
			matchConditions.push({ "metadata.licensing.price": priceFilter });
		}

		if (creatorId) {
			matchConditions.push({ "metadata.ownership.creator_account_id": creatorId });
		}
		if (tags && tags.length > 0) {
			matchConditions.push({ "metadata.general.tags": { $in: tags } });
		}

		// Build aggregation pipeline
		const pipeline: any[] = [];

		// Match stage
		if (matchConditions.length > 0) {
			pipeline.push({ $match: { $and: matchConditions } });
		}

		// Sort stage
		const sort: any = {};
		if (sortBy === "relevance" && query) {
			sort.score = { $meta: "textScore" };
		} else if (sortBy === "price") {
			sort["metadata.licensing.price"] = sortOrder === "asc" ? 1 : -1;
		} else if (sortBy === "size") {
			sort["metadata.general.size"] = sortOrder === "asc" ? 1 : -1;
		} else if (sortBy === "name") {
			sort["metadata.general.name"] = sortOrder === "asc" ? 1 : -1;
		} else {
			sort.score = { $meta: "textScore" }; // Default to relevance if query exists
		}
		pipeline.push({ $sort: sort });

		// Pagination
		pipeline.push({ $skip: skip });
		pipeline.push({ $limit: maxResults });

		// Execute query
		const assets = await this.assetModel.aggregate(pipeline).exec();

		// Get total count for pagination
		const countPipeline = [...pipeline];
		countPipeline.splice(-2, 2); // Remove skip and limit
		countPipeline.push({ $count: "total" });
		const countResult = await this.assetModel.aggregate(countPipeline).exec();
		const total = countResult[0]?.total || 0;

		return { results: assets, count: total };
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
			url: "http://localhost:7834/api/hcs-topics/create-topic-and-message",
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
			console.log("errror", error);
			throw new Error("Failed to store metadata on HCS: " + error.message);
		}
	}
}
