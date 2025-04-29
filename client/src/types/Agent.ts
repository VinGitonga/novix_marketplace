export interface IAgent {
	_id: string;
	createdAt: string;
	updatedAt: string;
	name: string;
	username: string;
	summary: string;
	prompt: string;
	description: string;
	elizaId: string;
	elizaMetadata: Record<string, any>;
	bio: string[];
	topics: string[];
	worldId?: string;
}
