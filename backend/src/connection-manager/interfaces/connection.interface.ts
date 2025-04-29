export interface Connection {
	id: string;
	topicId: string;
	targetAccountId: string;
	initiatorInboundTopicId?: string; // Added to store initiator's inboundTopicId
}
