interface IGeneral {
	name: string;
	description: string;
	category: string;
	version?: string;
	file_format: string;
	size: number;
	tags?: string[];
}

interface IModelDetails {
	framework?: string;
	architecture?: string;
	training_dataset_summary?: string;
	input_requirements?: string;
	output_format?: string;
}

interface IDatasetDetails {
	schema?: string;
	sample_size?: number;
	data_source?: string;
	annotation_method?: string;
}

interface IBenchmarkData {
	dataset: string;
	metric_name: string;
	metric_value: string;
	evaluation_details?: string;
}

interface ILicensing {
	license_type: string;
	price: number;
	currency: string;
	usage_restrictions?: string[];
	duration: string;
	transferability: boolean;
	royalty_percentage?: number;
}

interface IOwnership {
	creator_account_id: string;
	proof_of_ownership?: string;
	data_source_compliance?: string;
}

interface IStorage {
	ipfs_cid?: string;
	access_url?: string;
	encryption_status: boolean;
}

interface IAdditional {
	sample_data_url?: string;
	documentation_url?: string;
	publication_date?: string;
	last_updated?: string;
}

export interface IMetadata {
	asset_type: "model" | "dataset";
	general: IGeneral;
	technical: {
		model_details?: IModelDetails;
		dataset_details?: IDatasetDetails;
	};
	benchmark_data?: IBenchmarkData[];
	licensing: ILicensing;
	ownership: IOwnership;
	storage: IStorage;
	additional?: IAdditional;
}

export interface IAssetInfo {
	metadata: IMetadata;
	_id: string;
	hcs_topic_id: string;
}
