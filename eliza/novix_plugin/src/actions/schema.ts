import { z } from "zod";

export const novixAgentsListingParamsSchema = z.object({
  query: z
    .string()
    .describe("The natural language query to search for AI agents"),
  maxResults: z
    .number()
    .min(1)
    .max(50)
    .optional()
    .describe("Maximum number of results to return (default: 10)"),
});
