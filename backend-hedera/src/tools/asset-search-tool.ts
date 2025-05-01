import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";
import { IAssetInfo } from "src/types/Asset";

export class AssetSearchTool extends StructuredTool {
  name = "search_assets_from_marketplace";
  description =
    "Search for AI models and datasets in the Novix marketplace using natural language and filters";

  schema = z.object({
    query: z
      .string()
      .optional()
      .describe(
        "Natural language query to search for assets (e.g., 'sentiment analysis model')"
      ),
    assetType: z
      .enum(["model", "dataset"])
      .optional()
      .describe("Filter by asset type: 'model' or 'dataset'"),
    category: z
      .string()
      .optional()
      .describe("Filter by category (e.g., 'NLP', 'Tabular Data')"),
    licenseType: z
      .string()
      .optional()
      .describe("Filter by license type (e.g., 'Commercial', 'MIT')"),
    priceMin: z.number().min(0).optional().describe("Minimum price in HBAR"),
    priceMax: z.number().min(0).optional().describe("Maximum price in HBAR"),
    creatorId: z
      .string()
      .optional()
      .describe("Filter by creator account ID (e.g., '0.0.123456')"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Filter by tags (e.g., ['sentiment', 'nlp'])"),
    sortBy: z
      .enum(["relevance", "price", "size", "name"])
      .optional()
      .describe(
        "Sort by: 'relevance' (text score), 'price', 'size', or 'name'"
      ),
    sortOrder: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort order: 'asc' (ascending) or 'desc' (descending)"),
    maxResults: z
      .number()
      .min(1)
      .max(50)
      .optional()
      .describe("Maximum number of results to return (default: 10)"),
    skip: z
      .number()
      .min(0)
      .optional()
      .describe("Number of results to skip for pagination (default: 0)"),
    countOnly: z
      .boolean()
      .optional()
      .describe(
        "Return only the total count of matching assets (default: false)"
      ),
  });

  constructor(private dbBackendUrl: string = "http://localhost:6534/api") {
    super();
  }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    try {
      const {
        query,
        assetType,
        category,
        licenseType,
        priceMin,
        priceMax,
        creatorId,
        tags,
        sortBy,
        sortOrder,
        maxResults,
        skip,
        countOnly
      } = input;

      const response = await axios.post<{
        status: "success" | "error";
        data: { results: IAssetInfo[]; count: number };
      }>(`${this.dbBackendUrl}/assets/search/by-nlp`, {
        query,
        assetType,
        category,
        licenseType,
        priceMin,
        priceMax,
        creatorId,
        tags,
        sortBy,
        sortOrder,
        maxResults,
        skip,
        countOnly
      });

      const respData = response.data;

      if (respData?.status === "success") {
        const { results, count } = respData.data;

        if (countOnly) {
          return `Total assets: ${count}`;
        }

        let result = `Found ${count} Asset(s):\n\n`;
        results.forEach((asset, idx) => {
          const { metadata } = asset;
          result += `Asset: ${metadata.general.name}\n`;
          result += `AssetID: ${asset._id}\n`;
          result += `Type: ${metadata.asset_type}\n`;
          result += `Category: ${metadata.general.category}\n`;
          result += `Description: ${metadata.general.description}\n`;
          result += `File Format: ${metadata.general.file_format}\n`;
          result += `Size: ${metadata.general.size} bytes\n`;
          result += `Tags: ${metadata.general.tags?.join(", ") || "None"}\n`;
          result += `License: ${metadata.licensing.license_type}\n`;
          result += `Price: ${metadata.licensing.price} ${metadata.licensing.currency}\n`;
          result += `Creator: ${metadata.ownership.creator_account_id}\n`;
          if (metadata.benchmark_data?.length) {
            result += `Benchmark: ${metadata.benchmark_data[0].metric_name}=${metadata.benchmark_data[0].metric_value} on ${metadata.benchmark_data[0].dataset}\n`;
          }
          result += "\n";
        });

        console.log(`result`, result);

        return result;
      }

      return "No assets found";
    } catch (err) {
      console.log("errrooror", err);
      return `Error searching for assets: ${
        err instanceof Error ? err.message : String(err)
      }`;
    }
  }
}
