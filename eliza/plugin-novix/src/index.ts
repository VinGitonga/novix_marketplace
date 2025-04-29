import type { Plugin } from "@elizaos/core";
import { marketplaceAgents } from "./actions";

export const novixPlugin: Plugin = {
  name: "Novix",
  description: "Novix API integration plugin",
  providers: [],
  evaluators: [],
  services: [],
  actions: [marketplaceAgents],
};

