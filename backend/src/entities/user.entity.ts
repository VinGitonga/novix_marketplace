import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true })
	name: string;

	@Prop({ required: true })
	username: string;

	@Prop({ required: true, unique: true })
	accountId: string;

	@Prop({ required: false })
	entityId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
