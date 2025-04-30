import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Credits {
	@Prop({ type: Number, required: true, min: 0 })
	count: number;

	@Prop({ required: true, unique: true })
	accountId: string;

	@Prop({ required: true })
	agentId: string;
}

export const CreditsSchema = SchemaFactory.createForClass(Credits);
