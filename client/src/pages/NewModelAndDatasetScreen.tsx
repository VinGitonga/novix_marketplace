import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TbTopologyComplex } from "react-icons/tb";
import { BsTools } from "react-icons/bs";
import { FaChartBar } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { IoMdCloudUpload } from "react-icons/io";
import { MdAddComment } from "react-icons/md";
import AppInput from "@/components/form/AppInput";
import AppTextarea from "@/components/form/AppTextarea";
import AppCreateableSelect from "@/components/form/AppCreatableSelect";
import { generateOptions } from "@/lib/utils";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AppCombobox from "@/components/form/AppCombobox";
import AppMultiSelect from "@/components/form/AppMultiSelect";
import AppSwitch from "@/components/form/AppSwitch";
import AppFileUpload from "@/components/form/AppFileUpload";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "@/env";
import AppDatePicker from "@/components/form/AppDatePicker";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/providers/HashinalWalletProvider";
import useAssetData from "@/hooks/useAssetsData";
import { toast } from "sonner";

const GeneralSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().min(1, "Description is required"),
	category: z.string().min(1, "Category is required"),
	version: z.string().optional(),
	file_format: z.string().min(1, "File format is required"),
	// size: z.number().min(0, "Size must be non-negative"),
	size: z.coerce.string().transform((val) => {
		const parsed = parseFloat(val);
		if (isNaN(parsed)) {
			throw new Error("Invalid Size");
		}
		if (parsed < 0) {
			throw new Error("Size must be non-negative");
		}
		return String(parsed);
	}),
	tags: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

const ModelDetailsSchema = z.object({
	framework: z.string().optional(),
	architecture: z.string().optional(),
	training_dataset_summary: z.string().optional(),
	input_requirements: z.string().optional(),
	output_format: z.string().optional(),
});

const DatasetDetailsSchema = z.object({
	schema: z.string().optional(),
	sample_size: z.number().min(0).optional(),
	data_source: z.string().optional(),
	annotation_method: z.string().optional(),
});

const BenchmarkDataSchema = z.object({
	dataset: z.string().min(1, "Benchmark dataset is required"),
	metric_name: z.string().min(1, "Metric name is required"),
	metric_value: z.string().min(1, "Metric value is required"),
	evaluation_details: z.string().optional(),
});

const LicensingSchema = z.object({
	license_type: z.string().min(1, "License type is required"),
	// price: z.number().min(0, "Price must be non-negative"),
	price: z.coerce.string().transform((val) => {
		const parsed = parseFloat(val);
		if (isNaN(parsed)) {
			throw new Error("Invalid Size");
		}
		if (parsed < 0) {
			throw new Error("Size must be non-negative");
		}
		return String(parsed);
	}),
	currency: z.string().min(1, "Currency is required"),
	usage_restrictions: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
	duration: z.string().min(1, "Duration is required"),
	transferability: z.boolean(),
	royalty_percentage: z.number().min(0).max(100).optional(),
});

// Ownership
const OwnershipSchema = z.object({
	creator_account_id: z.string().min(1, "Creator account ID is required"),
	proof_of_ownership: z.string().optional(),
	data_source_compliance: z.string().optional(),
});

const StorageSchema = z.object({
	ipfs_cid: z.string().optional(), // Populated by backend after IPFS upload
	access_url: z.string().optional(),
	encryption_status: z.boolean(),
});

// Additional information
const AdditionalSchema = z.object({
	sample_data_url: z.string().optional(),
	documentation_url: z.string().optional(),
	publication_date: z.date().optional(),
	last_updated: z.string().optional(),
});

const MetadataSchema = z.discriminatedUnion("asset_type", [
	z.object({
		asset_type: z.literal("model"),
		general: GeneralSchema,
		technical: z.object({
			model_details: ModelDetailsSchema,
			dataset_details: z.undefined().optional(),
		}),
		benchmark_data: BenchmarkDataSchema,
		licensing: LicensingSchema,
		ownership: OwnershipSchema,
		storage: StorageSchema,
		additional: AdditionalSchema.optional(),
	}),
	z.object({
		asset_type: z.literal("dataset"),
		general: GeneralSchema,
		technical: z.object({
			model_details: z.undefined().optional(),
			dataset_details: DatasetDetailsSchema,
		}),
		benchmark_data: z.array(BenchmarkDataSchema).optional(),
		licensing: LicensingSchema,
		ownership: OwnershipSchema,
		storage: StorageSchema,
		additional: AdditionalSchema.optional(),
	}),
]);

type Metadata = z.infer<typeof MetadataSchema>;

const NewModelAndDatasetScreen = () => {
	const fileRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState("general");
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const { createNewAsset } = useAssetData();

	const { accountId } = useWallet();

	const tabs = ["general", "technical", "benchmark", "license", "upload", "additional"];

	const formMethods = useForm<Metadata>({
		resolver: zodResolver(MetadataSchema),
		defaultValues: {
			asset_type: "model",
			general: { size: "0", tags: [] },
			technical: { model_details: undefined, dataset_details: undefined },
			licensing: { price: "0", transferability: false, currency: "HBAR" },
			ownership: {
				creator_account_id: accountId!,
			},
			storage: { encryption_status: false },
		},
	});

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = formMethods;

	const assetType = watch("asset_type");

	const onSubmit = handleSubmit(async (data) => {
		const cleanedTags = data.general.tags?.map((item) => item.value);
		const cleanedUsages = data.licensing.usage_restrictions?.map((item) => item.value);

		const info = {
			asset_type: data.asset_type,
			general: {
				...data.general,
				tags: cleanedTags,
				size: Number(data.general.size),
			},
			technical: data.technical,
			licensing: {
				...data.licensing,
				usage_restrictions: cleanedUsages,
				price: Number(data.licensing.price),
			},
			ownership: data.ownership,
			storage: data.storage,
			additional: data.additional,
			benchmark_data: [data.benchmark_data],
		};

		setIsSaving(true);
		try {
			const resp = await createNewAsset(info as any);

			if (resp?.status === "success") {
				toast.success("Asset created successfully");
			} else {
				toast.error("Failed to create an asset");
			}
		} catch (err) {
			toast.error("Failed to create an asset");
		}
	});

	const handlePickFile = async (e: ChangeEvent<HTMLInputElement>) => {
		const itemFile = e?.target?.files?.[0];
		if (!itemFile) return;

		setFile(itemFile);

		// Upload to backend now
		const formData = new FormData();
		formData.append("file", itemFile);

		setIsUploading(true);
		try {
			const rawResp = await axios.post(`${API_URL}/uploads/single`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (rawResp.status === 200) {
				const { data } = rawResp.data;
				setValue("storage.ipfs_cid", data);
			}
		} catch (err) {
			console.log("err", err);
		} finally {
			setIsUploading(false);
		}
	};

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
	};

	const handleNext = () => {
		const currentIndex = tabs.indexOf(activeTab);
		if (currentIndex < tabs.length - 1) {
			setActiveTab(tabs[currentIndex + 1]);
		}
	};

	const handlePrevious = () => {
		const currentIndex = tabs.indexOf(activeTab);
		if (currentIndex > 0) {
			setActiveTab(tabs[currentIndex - 1]);
		}
	};

	useEffect(() => {
		if (accountId) {
			setValue("ownership.creator_account_id", accountId!);
		}
	}, [accountId]);

	return (
		<>
			<title>New Asset - Novix</title>
			<div className="space-y-2 mt-3">
				<h1 className="text-lg font-semibold">Upload a new assets</h1>
				<p className="text-gray-300 text-sm">This page allows you to upload a new asset and be able to license it.</p>
			</div>
			<Separator />
			<Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
				<div className="container h-full py-6 w-full">
					<TabsList className="grid grid-cols-6 gap-5 dark">
						<TabsTrigger className="dark" value="general">
							<TbTopologyComplex />
							<span className="ml-2">General</span>
						</TabsTrigger>
						<TabsTrigger className="dark" value="technical">
							<BsTools />
							<span className="ml-2">Technical Details</span>
						</TabsTrigger>
						<TabsTrigger className="dark" value="benchmark">
							<FaChartBar />
							<span className="ml-2">Benchmark</span>
						</TabsTrigger>
						<TabsTrigger className="dark" value="license">
							<IoDocumentText />
							<span className="ml-2"> Licensing</span>
						</TabsTrigger>
						<TabsTrigger className="dark" value="upload">
							<IoMdCloudUpload />
							<span className="ml-2"> Upload</span>
						</TabsTrigger>
						<TabsTrigger className="dark" value="additional">
							<MdAddComment />
							<span className="ml-2"> Additional Info</span>
						</TabsTrigger>
					</TabsList>
					<FormProvider {...formMethods}>
						<form className="my-5" onSubmit={onSubmit}>
							<TabsContent value="general" className="space-y-5">
								<AppInput name="general.name" control={control} label="Name" placeholder="Enter a descriptive name for your asset" />
								<AppTextarea name="general.description" control={control} label="Description" placeholder="Provide a detailed description of your model or dataset" />
								<AppInput name="general.category" control={control} label="Category" placeholder="e.g., Computer Vision, NLP, Tabular Data" />
								<AppInput name="general.version" control={control} label="Version" placeholder="e.g., 1.0.0" />
								<AppInput name="general.file_format" control={control} label="File Format" placeholder="e.g., .h5, .pkl, .onnx, .csv" />
								<AppInput name="general.size" control={control} label="Size" type="number" placeholder="Size in bytes" />
								<AppCreateableSelect name="general.tags" control={control} label="Tags" placeholder="Add relevant tags" error={errors.general?.tags as any} />
								<div className="flex justify-end space-x-4 mt-6">
									<Button type="button" onClick={handleNext} className="dark">
										Next
									</Button>
								</div>
							</TabsContent>
							<TabsContent value="technical" className="space-y-5 w-full">
								<AppCombobox name="asset_type" control={control} label="Asset Type" options={generateOptions(["model", "dataset"])} placeholder="Select asset type" />
								{assetType === "model" && (
									<>
										<AppInput name="technical.model_details.framework" control={control} label="Framework" placeholder="e.g., PyTorch, TensorFlow, JAX" />
										<AppInput name="technical.model_details.architecture" control={control} label="Architecture" placeholder="e.g., Transformer, ResNet, LSTM" />
										<AppInput name="technical.model_details.training_dataset_summary" control={control} label="Training Request Summary" placeholder="Brief description of the training dataset used" />
										<AppInput name="technical.model_details.input_requirements" control={control} label="Input Requirements" placeholder="e.g., Image size 224x224, Text sequence max length 512" />
										<AppInput name="technical.model_details.output_format" control={control} label="Output Requirements" placeholder="e.g., Class probabilities, Token embeddings" />
									</>
								)}
								{assetType === "dataset" && (
									<>
										<AppInput name="technical.dataset_details.schema" control={control} label="Schema" placeholder="Describe the data structure and fields" />
										<AppInput name="technical.dataset_details.sample_size" control={control} type="number" label="Sample Size" placeholder="Total number of samples/records" />
										<AppInput name="technical.dataset_details.data_source" control={control} label="Datasource" placeholder="Origin of the data, e.g., Web scraping, Sensor data" />
										<AppInput name="technical.dataset_details.annotation_method" control={control} label="Annotation Method" placeholder="e.g., Manual labeling, Semi-supervised, Automated" />
									</>
								)}
								<div className="flex justify-between mt-6">
									<Button type="button" onClick={handlePrevious} variant="secondary" className="dark">
										Previous
									</Button>
									<Button type="button" onClick={handleNext} className="dark">
										Next
									</Button>
								</div>
							</TabsContent>
							<TabsContent value="benchmark" className="space-y-5 w-full">
								<>
									<AppInput name="benchmark_data.dataset" control={control} label="Dataset" placeholder="Name of the benchmark dataset used" />
									<AppInput name="benchmark_data.metric_name" control={control} label="Metric Name" placeholder="e.g., Accuracy, F1-score, BLEU" />
									<AppInput name="benchmark_data.metric_value" control={control} label="Metric Value" placeholder="Numerical value of the metric" />
									<AppInput name="benchmark_data.evaluation_details" control={control} label="Evaluation Details" placeholder="Additional context about the evaluation process" />
								</>
								<div className="flex justify-between mt-6">
									<Button type="button" onClick={handlePrevious} variant="secondary" className="dark">
										Previous
									</Button>
									<Button type="button" onClick={handleNext} className="dark">
										Next
									</Button>
								</div>
							</TabsContent>
							<TabsContent value="license" className="space-y-5 w-full">
								<AppCombobox
									name="licensing.license_type"
									control={control}
									label="License Type"
									options={generateOptions(["MIT", "Apache 2.0", "CC-BY 4.0", "Commercial", "Research Only", "Proprietary"])}
									placeholder="Select a license type"
								/>
								<AppInput name="licensing.price" control={control} type="number" label="Price" placeholder="Price in selected currency" />
								<AppMultiSelect
									name="licensing.usage_restrictions"
									control={control}
									label="Usage retrictions"
									options={generateOptions(["No modification", "No redistribution", "Commercial use only", "Attribution required", "Include license notice"])}
									placeholder="Select applicable restrictions"
								/>
								<AppInput name="licensing.duration" control={control} label="Duration" placeholder="e.g., 1 year, perpetual" />
								<AppSwitch name="licensing.transferability" control={control} label="Transferable" />
								<div className="flex justify-between mt-6">
									<Button type="button" onClick={handlePrevious} variant="secondary" className="dark">
										Previous
									</Button>
									<Button type="button" onClick={handleNext} className="dark">
										Next
									</Button>
								</div>
							</TabsContent>
							<TabsContent value="upload" className="space-y-5 w-full">
								<AppFileUpload label="Upload file" helperText="Choose any file" inputRef={fileRef} selectedFile={file!} onValueChange={handlePickFile} />
								<div className="flex justify-between mt-6">
									<Button type="button" onClick={handlePrevious} variant="secondary" className="dark">
										Previous
									</Button>
									<Button type="button" onClick={handleNext} className="dark">
										Next
									</Button>
								</div>
							</TabsContent>
							<TabsContent value="additional" className="space-y-5 w-full">
								<AppInput name="additional.sample_data_url" control={control} label="Sample Data URL" placeholder="URL to sample data or demo" />
								<AppInput name="additional.documentation_url" control={control} label="Documentation URL" placeholder="URL to documentation or GitHub repository" />
								<AppDatePicker name="additional.publication_date" control={control} label="Publication Date" triggerWidth="w-full" placeholder="Select publication date" />
								<div className="flex justify-between mt-6">
									<Button type="button" onClick={handlePrevious} variant="secondary" className="dark">
										Previous
									</Button>
									<Button type="submit" variant="default" className="dark">
										Submit
									</Button>
								</div>
							</TabsContent>
						</form>
					</FormProvider>
				</div>
			</Tabs>
		</>
	);
};

export default NewModelAndDatasetScreen;
