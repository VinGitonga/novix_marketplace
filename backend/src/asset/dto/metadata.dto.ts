import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsEnum, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class GeneralDto {
	@IsString()
	name: string;

	@IsString()
	description: string;

	@IsString()
	category: string;

	@IsString()
	@IsOptional()
	version?: string;

	@IsString()
	file_format: string;

	@IsNumber()
	size: number;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	tags?: string[];
}

class ModelDetailsDto {
	@IsString()
	@IsOptional()
	framework?: string;

	@IsString()
	@IsOptional()
	architecture?: string;

	@IsString()
	@IsOptional()
	training_dataset_summary?: string;

	@IsString()
	@IsOptional()
	input_requirements?: string;

	@IsString()
	@IsOptional()
	output_format?: string;
}

class DatasetDetailsDto {
	@IsString()
	@IsOptional()
	schema?: string;

	@IsNumber()
	@IsOptional()
	sample_size?: number;

	@IsString()
	@IsOptional()
	data_source?: string;

	@IsString()
	@IsOptional()
	annotation_method?: string;
}

class BenchmarkDataDto {
	@IsString()
	dataset: string;

	@IsString()
	metric_name: string;

	@IsString()
	metric_value: string;

	@IsString()
	@IsOptional()
	evaluation_details?: string;
}

class LicensingDto {
	@IsString()
	license_type: string;

	@IsNumber()
	price: number;

	@IsString()
	currency: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	usage_restrictions?: string[];

	@IsString()
	duration: string;

	@IsBoolean()
	transferability: boolean;

	@IsNumber()
	@IsOptional()
	royalty_percentage?: number;
}

class OwnershipDto {
	@IsString()
	creator_account_id: string;

	@IsString()
	@IsOptional()
	proof_of_ownership?: string;

	@IsString()
	@IsOptional()
	data_source_compliance?: string;
}

class StorageDto {
	@IsString()
	@IsOptional()
	ipfs_cid?: string;

	@IsString()
	@IsOptional()
	access_url?: string;

	@IsBoolean()
	encryption_status: boolean;
}

class AdditionalDto {
	@IsString()
	@IsOptional()
	sample_data_url?: string;

	@IsString()
	@IsOptional()
	documentation_url?: string;

	@IsString()
	@IsOptional()
	publication_date?: string;

	@IsString()
	@IsOptional()
	last_updated?: string;
}

export class MetadataDto {
	@IsEnum(["model", "dataset"])
	asset_type: "model" | "dataset";

	@ValidateNested()
	@Type(() => GeneralDto)
	general: GeneralDto;

	@ValidateNested()
	@Type(() => Object)
	technical: {
		model_details?: ModelDetailsDto;
		dataset_details?: DatasetDetailsDto;
	};

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => BenchmarkDataDto)
	@IsOptional()
	benchmark_data?: BenchmarkDataDto[];

	@ValidateNested()
	@Type(() => LicensingDto)
	licensing: LicensingDto;

	@ValidateNested()
	@Type(() => OwnershipDto)
	ownership: OwnershipDto;

	@ValidateNested()
	@Type(() => StorageDto)
	storage: StorageDto;

	@ValidateNested()
	@Type(() => AdditionalDto)
	@IsOptional()
	additional?: AdditionalDto;
}
