import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccessDocument = HydratedDocument<Access>;

@Schema({/* timestamps: true,*/ optimisticConcurrency: true, })
export class Access {
  @Prop({ required: true, })
  wallet: string;
  
  @Prop({ required: true, })
  accessCount: number;

  @Prop({ required: true })
  accessTime: Date;

  @Prop({ required: true })
  accessYear?: string;

  @Prop({ required: true })
  accessMonth?: string;

  @Prop({ required: true })
  accessDate?: string;

  @Prop({ required: true })
  accessHour?: string;

  @Prop({ required: true })
  accessMinute?: string;
}

export const AccessSchema = SchemaFactory.createForClass(Access);
