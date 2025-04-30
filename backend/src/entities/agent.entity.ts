import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.entity";
import mongoose from "mongoose";

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

	@Prop({ required: false, default: null })
	worldId: string;

	@Prop({ type: Object })
	elizaMetadata: Record<string, any>;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
	owner: User;

	@Prop()
	price: number;

	@Prop()
	credits: number;

	@Prop({})
	pricingModel: string;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

AgentSchema.index({ summary: "text", description: "text", topics: "text", bio: "text", prompt: "text", name: "text" });
