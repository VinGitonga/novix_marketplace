export interface AgentIdentity {
  name: string;
  accountId: string;
  privateKey: string;
  inboundTopicId: string;
  outboundTopicId: string;
  profileTopicId?: string;
}
