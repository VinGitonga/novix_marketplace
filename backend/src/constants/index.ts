export const ELIZA_BASE_URL = "http://localhost:3000/api";
export const createAgentDefaults = {
	plugins: ["@elizaos/plugin-sql", "@elizaos/plugin-openai"],
	settings: {
		secrets: {},
	},
	style: {
		all: ["Use clear, concise, and technical language", "Be accurate and precise", "Reference documentation when applicable"],
		chat: ["Provide helpful examples", "Ask clarifying questions when needed"],
		post: ["Structure explanations clearly"],
	},
};
export const HEDERA_BACKEND_BASE_URL = "http://localhost:7834/api"
