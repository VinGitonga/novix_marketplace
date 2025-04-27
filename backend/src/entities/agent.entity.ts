import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Agent {
	@Prop({ required: true })
	name: string;

	@Prop({})
	username: string;

	@Prop({ required: true })
	description: string;

	@Prop({ required: true })
	summary: string;

	@Prop({ type: Array })
	bio: string[];

	@Prop()
	prompt: string;

	@Prop({ type: Array })
	topics: string[];

	@Prop()
	elizaId: string;

	@Prop({ type: Object })
	elizaMetadata: Record<string, any>;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
