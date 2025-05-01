import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class General {
	@Prop({ required: true })
	name: string;

	@Prop({ required: true })
	description: string;

	@Prop({ required: true })
	category: string;

	@Prop()
	version?: string;

	@Prop({ required: true })
	file_format: string;

	@Prop({ required: true })
	size: number;

	@Prop([String])
	tags?: string[];
}

@Schema()
export class ModelDetails {
	@Prop()
	framework?: string;

	@Prop()
	architecture?: string;

	@Prop()
	training_dataset_summary?: string;

	@Prop()
	input_requirements?: string;

	@Prop()
	output_format?: string;
}

const ModelDetailsSchema = SchemaFactory.createForClass(ModelDetails);

@Schema()
export class DatasetDetails {
	@Prop()
	schema?: string;

	@Prop()
	sample_size?: number;

	@Prop()
	data_source?: string;

	@Prop()
	annotation_method?: string;
}

const DatasetDetailsSchema = SchemaFactory.createForClass(DatasetDetails);

@Schema()
export class BenchmarkData {
	@Prop({ required: true })
	dataset: string;

	@Prop({ required: true })
	metric_name: string;

	@Prop({ required: true })
	metric_value: string;

	@Prop()
	evaluation_details?: string;
}

@Schema()
export class Licensing {
	@Prop({ required: true })
	license_type: string;

	@Prop({ required: true })
	price: number;

	@Prop({ required: true })
	currency: string;

	@Prop([String])
	usage_restrictions?: string[];

	@Prop({ required: true })
	duration: string;

	@Prop({ required: true })
	transferability: boolean;

	@Prop()
	royalty_percentage?: number;
}

@Schema()
export class Ownership {
	@Prop({ required: true })
	creator_account_id: string;

	@Prop()
	proof_of_ownership?: string;

	@Prop()
	data_source_compliance?: string;
}

@Schema()
export class Storage {
	@Prop()
	ipfs_cid?: string;

	@Prop()
	access_url?: string;

	@Prop({ required: true })
	encryption_status: boolean;
}

@Schema()
export class Additional {
	@Prop()
	sample_data_url?: string;

	@Prop()
	documentation_url?: string;

	@Prop()
	publication_date?: string;

	@Prop()
	last_updated?: string;
}

@Schema()
export class Metadata {
	@Prop({ enum: ["model", "dataset"], required: true })
	asset_type: "model" | "dataset";

	@Prop({ type: General, required: true })
	general: General;

	@Prop({
		type: {
			model_details: { type: ModelDetailsSchema, required: false },
			dataset_details: { type: DatasetDetailsSchema, required: false },
		},
		required: true,
	})
	technical: {
		model_details?: ModelDetails;
		dataset_details?: DatasetDetails;
	};

	@Prop([BenchmarkData])
	benchmark_data?: BenchmarkData[];

	@Prop({ type: Licensing, required: true })
	licensing: Licensing;

	@Prop({ type: Ownership, required: true })
	ownership: Ownership;

	@Prop({ type: Storage, required: true })
	storage: Storage;

	@Prop({ type: Additional })
	additional?: Additional;
}

@Schema()
export class Asset extends Document {
	@Prop({ type: Metadata, required: true })
	metadata: Metadata;

	@Prop({ required: true })
	hcs_topic_id: string;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

AssetSchema.index({ "metadata.asset_type": 1 });
AssetSchema.index({ "metadata.general.name": 1 });
AssetSchema.index({ "metadata.general.description": 1 });
AssetSchema.index({ "metadata.general.category": 1 });
AssetSchema.index({ "metadata.general.tags": 1 });
AssetSchema.index({ "metadata.licensing.license_type": 1 });
AssetSchema.index({ "metadata.licensing.price": 1 });
AssetSchema.index({ "metadata.ownership.creator_account_id": 1 });

// Compound index for common filter combinations
AssetSchema.index({
	"metadata.asset_type": 1,
	"metadata.general.category": 1,
	"metadata.licensing.license_type": 1,
});

// Text index for basic text search
AssetSchema.index({
	"metadata.general.name": "text",
	"metadata.general.description": "text",
	"metadata.general.tags": "text",
});
